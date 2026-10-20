export type TimeUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'

export interface ParsedTime {
  date: Date
  /** How a numeric input was interpreted; undefined for date strings. */
  unit?: TimeUnit
}

/** Parses a Unix timestamp (unit guessed from its size) or any date string the browser understands. */
export function parseTime(input: string): ParsedTime {
  const text = input.trim()
  if (!text) throw new Error('Enter a timestamp or a date')
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const value = Number(text)
    const magnitude = Math.abs(value)
    const [unit, divisor]: [TimeUnit, number] =
      magnitude >= 1e17 ? ['nanoseconds', 1e6]
      : magnitude >= 1e14 ? ['microseconds', 1e3]
      : magnitude >= 1e11 ? ['milliseconds', 1]
      : ['seconds', 1e-3]
    return { date: checked(new Date(value / divisor)), unit }
  }
  return { date: checked(new Date(text)) }
}

function checked(date: Date): Date {
  if (Number.isNaN(date.getTime())) throw new Error('Could not understand that as a timestamp or a date')
  return date
}

export function isoWeek(date: Date): { year: number; week: number } {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const weekday = day.getUTCDay() || 7
  day.setUTCDate(day.getUTCDate() + 4 - weekday) // Thursday decides the ISO year
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1)
  return { year: day.getUTCFullYear(), week: Math.ceil(((day.getTime() - yearStart) / 86400000 + 1) / 7) }
}

export function dayOfYear(date: Date): number {
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000) + 1
}

const relativeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

export function relativeTime(date: Date, now: Date): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, size] of relativeUnits) {
    if (Math.abs(seconds) >= size || unit === 'second') return format.format(Math.round(seconds / size), unit)
  }
  return ''
}

export function formatInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date)
}

/** One row per representation of the instant, in UTC unless a zone is given. */
export function describeTime(date: Date, timeZone: string, now: Date): { label: string; value: string }[] {
  const week = isoWeek(date)
  const ms = date.getTime()
  return [
    { label: 'Unix (seconds)', value: String(Math.floor(ms / 1000)) },
    { label: 'Unix (milliseconds)', value: String(ms) },
    { label: 'ISO 8601 (UTC)', value: date.toISOString() },
    { label: 'RFC 2822', value: date.toUTCString() },
    { label: timeZone, value: formatInZone(date, timeZone) },
    { label: 'Relative', value: relativeTime(date, now) },
    { label: 'ISO week', value: `${week.year}-W${String(week.week).padStart(2, '0')}` },
    { label: 'Day of year', value: String(dayOfYear(date)) },
  ]
}
