/**
 * Formats a date with a pattern like "YYYY-MM-DD HH:mm:ss" in any IANA time zone.
 * Text inside [brackets] is kept as is.
 */
export const dateTokens: [token: string, meaning: string][] = [
  ['YYYY', 'year, 2026'],
  ['YY', 'year, 26'],
  ['MMMM', 'month name, October'],
  ['MMM', 'short month, Oct'],
  ['MM', 'month, 01–12'],
  ['M', 'month, 1–12'],
  ['DD', 'day, 01–31'],
  ['D', 'day, 1–31'],
  ['dddd', 'weekday, Tuesday'],
  ['ddd', 'short weekday, Tue'],
  ['HH', 'hour, 00–23'],
  ['H', 'hour, 0–23'],
  ['hh', 'hour, 01–12'],
  ['h', 'hour, 1–12'],
  ['mm', 'minute, 00–59'],
  ['ss', 'second, 00–59'],
  ['SSS', 'millisecond, 000–999'],
  ['A', 'AM/PM'],
  ['Z', 'UTC offset, +02:00'],
  ['X', 'Unix seconds'],
  ['x', 'Unix milliseconds'],
]

// Longest tokens first so "MMMM" wins over "MM"; [literal] text is matched as one piece.
const tokenPattern = new RegExp(
  `\\[([^\\]]*)\\]|${dateTokens
    .map(([token]) => token)
    .sort((a, b) => b.length - a.length)
    .join('|')}`,
  'g',
)

interface Parts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
  offsetMinutes: number
}

function partsIn(date: Date, timeZone: string): Parts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const num = (type: string) => Number(get(type))
  const p = { year: num('year'), month: num('month'), day: num('day'), hour: num('hour'), minute: num('minute'), second: num('second') }
  // The offset is the difference between the wall-clock time in the zone and UTC.
  const wallClock = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const offsetMinutes = Math.round((wallClock - Math.floor(date.getTime() / 1000) * 1000) / 60000)
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { ...p, weekday, offsetMinutes }
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

export function formatDate(date: Date, pattern: string, timeZone = 'UTC', locale = 'en'): string {
  let p: Parts
  try {
    p = partsIn(date, timeZone)
  } catch {
    throw new Error(`Unknown time zone: ${timeZone}`)
  }
  // Month and weekday names in the chosen language, for a fixed date in that month / on that weekday.
  const name = (options: Intl.DateTimeFormatOptions, utcDate: Date) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utcDate)
  const monthDate = new Date(Date.UTC(2000, p.month - 1, 15))
  const weekdayDate = new Date(Date.UTC(2000, 0, 2 + p.weekday)) // 2 Jan 2000 was a Sunday
  const hour12 = p.hour % 12 || 12
  const sign = p.offsetMinutes < 0 ? '-' : '+'
  const offset = Math.abs(p.offsetMinutes)

  const values: Record<string, () => string> = {
    YYYY: () => pad(p.year, 4),
    YY: () => pad(p.year % 100),
    MMMM: () => name({ month: 'long' }, monthDate),
    MMM: () => name({ month: 'short' }, monthDate),
    MM: () => pad(p.month),
    M: () => String(p.month),
    DD: () => pad(p.day),
    D: () => String(p.day),
    dddd: () => name({ weekday: 'long' }, weekdayDate),
    ddd: () => name({ weekday: 'short' }, weekdayDate),
    HH: () => pad(p.hour),
    H: () => String(p.hour),
    hh: () => pad(hour12),
    h: () => String(hour12),
    mm: () => pad(p.minute),
    ss: () => pad(p.second),
    SSS: () => pad(((date.getTime() % 1000) + 1000) % 1000, 3),
    A: () => (p.hour < 12 ? 'AM' : 'PM'),
    Z: () => `${sign}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`,
    X: () => String(Math.floor(date.getTime() / 1000)),
    x: () => String(date.getTime()),
  }
  return pattern.replace(tokenPattern, (match, literal: string | undefined) => literal ?? values[match]())
}
