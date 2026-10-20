// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { countFeatures, parseGeoJson } from './geojson'
import { decodeJwt, signJwt, verifyJwt } from './jwt'
import { describeTime, isoWeek, parseTime, relativeTime } from './time'

// The well-known example token from jwt.io, signed with "your-256-bit-secret".
const jwtIo =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('jwt', () => {
  it('decodes', () => {
    const { header, payload } = decodeJwt(jwtIo)
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(payload.name).toBe('John Doe')
  })
  it('verifies HMAC signatures', async () => {
    expect(await verifyJwt(jwtIo, 'your-256-bit-secret')).toBe(true)
    expect(await verifyJwt(jwtIo, 'wrong')).toBe(false)
  })
  it('signs tokens that verify', async () => {
    const token = await signJwt({ alg: 'HS256', typ: 'JWT' }, { sub: '1234567890', name: 'John Doe', iat: 1516239022 }, 'your-256-bit-secret')
    expect(token).toBe(jwtIo)
  })
  it('verifies ES256 with a JWK public key', async () => {
    const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
    const b64 = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const unsigned = `${b64('{"alg":"ES256"}')}.${b64('{"a":1}')}`
    const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(unsigned)))
    const token = `${unsigned}.${b64(String.fromCharCode(...sig))}`
    const jwk = JSON.stringify(await crypto.subtle.exportKey('jwk', publicKey))
    expect(await verifyJwt(token, jwk)).toBe(true)
  })
  it('rejects malformed tokens', () => {
    expect(() => decodeJwt('abc')).toThrow(/three parts/)
  })
})

describe('time', () => {
  it('guesses the unit of numeric timestamps', () => {
    expect(parseTime('1700000000')).toEqual({ date: new Date(1700000000000), unit: 'seconds' })
    expect(parseTime('1700000000123').unit).toBe('milliseconds')
    expect(parseTime('1700000000123456').unit).toBe('microseconds')
    expect(parseTime('1700000000123456789').date.getTime()).toBe(1700000000123)
  })
  it('parses date strings', () => {
    expect(parseTime('2024-01-01T00:00:00Z').date.getTime()).toBe(1704067200000)
    expect(() => parseTime('not a date')).toThrow()
  })
  it('computes ISO weeks across year boundaries', () => {
    expect(isoWeek(new Date('2021-01-03T12:00:00Z'))).toEqual({ year: 2020, week: 53 })
    expect(isoWeek(new Date('2024-12-30T12:00:00Z'))).toEqual({ year: 2025, week: 1 })
  })
  it('describes relative times', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    expect(relativeTime(new Date('2024-01-01T09:00:00Z'), now)).toBe('3 hours ago')
    expect(relativeTime(new Date('2024-01-02T12:00:00Z'), now)).toBe('tomorrow')
    expect(describeTime(now, 'UTC', now)[0].value).toBe('1704110400')
  })
})

describe('geojson', () => {
  it('accepts geometries, features and collections', () => {
    expect(countFeatures(parseGeoJson('{"type":"Point","coordinates":[10,60]}'))).toBe(1)
    expect(countFeatures(parseGeoJson('{"type":"FeatureCollection","features":[{},{}]}'))).toBe(2)
  })
  it('rejects non-GeoJSON', () => {
    expect(() => parseGeoJson('{"a":1}')).toThrow(/Not GeoJSON/)
    expect(() => parseGeoJson('{')).toThrow(/Invalid JSON/)
  })
})
