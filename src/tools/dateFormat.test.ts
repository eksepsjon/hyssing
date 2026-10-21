import { describe, expect, it } from 'vitest'
import { formatDate } from './dateFormat'

// Tuesday 20 October 2026, 13:05:09.042 UTC
const date = new Date(Date.UTC(2026, 9, 20, 13, 5, 9, 42))

describe('formatDate', () => {
  it('formats numeric tokens in UTC', () => {
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss.SSS')).toBe('2026-10-20 13:05:09.042')
    expect(formatDate(date, 'D/M/YY h:mm A')).toBe('20/10/26 1:05 PM')
    expect(formatDate(date, 'X x')).toBe('1792501509 1792501509042')
  })

  it('formats names in a language', () => {
    expect(formatDate(date, 'dddd D MMMM', 'UTC', 'en')).toBe('Tuesday 20 October')
    expect(formatDate(date, 'dddd D. MMMM', 'UTC', 'nb')).toBe('tirsdag 20. oktober')
    expect(formatDate(date, 'ddd MMM', 'UTC', 'en')).toBe('Tue Oct')
  })

  it('converts to other time zones with offsets', () => {
    expect(formatDate(date, 'YYYY-MM-DDTHH:mm:ssZ', 'Europe/Oslo')).toBe('2026-10-20T15:05:09+02:00')
    expect(formatDate(date, 'HH:mm Z', 'America/New_York')).toBe('09:05 -04:00')
    expect(formatDate(date, 'HH:mm Z', 'Asia/Kolkata')).toBe('18:35 +05:30')
    // Winter time
    expect(formatDate(new Date(Date.UTC(2026, 0, 1, 12)), 'HH Z', 'Europe/Oslo')).toBe('13 +01:00')
    expect(formatDate(date, 'Z')).toBe('+00:00')
  })

  it('keeps [literal] text', () => {
    expect(formatDate(date, '[Today is] dddd [at] HH:mm')).toBe('Today is Tuesday at 13:05')
  })

  it('rejects unknown time zones', () => {
    expect(() => formatDate(date, 'YYYY', 'Mars/Olympus')).toThrow(/Unknown time zone/)
  })
})
