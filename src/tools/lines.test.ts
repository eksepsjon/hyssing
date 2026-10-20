import { describe, expect, it } from 'vitest'
import {
  countLines,
  filterLines,
  joinLines,
  removeEmptyLines,
  seededRandom,
  replaceInLines,
  shuffleLines,
  sortLines,
  splitLines,
  uniqueLines,
} from './lines'

describe('lines', () => {
  it('splits and joins, keeping a trailing newline', () => {
    expect(splitLines('a\r\nb\n')).toEqual({ lines: ['a', 'b'], trailingNewline: true })
    expect(joinLines(splitLines('a\nb\n'))).toBe('a\nb\n')
    expect(joinLines(splitLines('a\nb'))).toBe('a\nb')
    expect(countLines('')).toBe(0)
    expect(countLines('a\nb\n')).toBe(2)
  })

  it('sorts', () => {
    expect(sortLines(['b', 'B', 'a'])).toEqual(['a', 'b', 'B'])
    expect(sortLines(['b', 'a', 'c'], { descending: true })).toEqual(['c', 'b', 'a'])
    expect(sortLines(['item10', 'item2', 'item1'], { natural: true })).toEqual(['item1', 'item2', 'item10'])
    expect(sortLines(['item10', 'item2'])).toEqual(['item10', 'item2'])
  })

  it('sorts by the chosen alphabet', () => {
    const words = ['ål', 'zebra', 'øl', 'and', 'ærlig']
    expect(sortLines(words, { locale: 'nb' })).toEqual(['and', 'zebra', 'ærlig', 'øl', 'ål'])
    expect(sortLines(words, { locale: 'en' })).toEqual(['ærlig', 'ål', 'and', 'øl', 'zebra'])
  })

  it('removes duplicates keeping the first occurrence', () => {
    expect(uniqueLines(['a', 'b', 'a', 'A'])).toEqual(['a', 'b', 'A'])
    expect(uniqueLines(['a', 'b', 'a', 'A'], { ignoreCase: true })).toEqual(['a', 'b'])
  })

  it('shuffles without losing lines', () => {
    const lines = ['1', '2', '3', '4', '5']
    expect(shuffleLines(lines, () => 0)).toEqual(['2', '3', '4', '5', '1'])
    expect(shuffleLines(lines).sort()).toEqual(lines)
    expect(shuffleLines(lines, seededRandom('x'))).toEqual(shuffleLines(lines, seededRandom('x')))
    expect(shuffleLines(lines, seededRandom('x'))).not.toEqual(shuffleLines(lines, seededRandom('y')))
  })

  it('removes empty lines', () => {
    expect(removeEmptyLines(['a', '', '  ', 'b'])).toEqual(['a', 'b'])
  })

  it('filters by regex', () => {
    const lines = ['error: x', 'info: y', 'ERROR: z']
    expect(filterLines(lines, '^error', { keep: true })).toEqual(['error: x'])
    expect(filterLines(lines, '^error', { keep: true, ignoreCase: true })).toEqual(['error: x', 'ERROR: z'])
    expect(filterLines(lines, '^error', { keep: false, ignoreCase: true })).toEqual(['info: y'])
    expect(() => filterLines(lines, '(', { keep: true })).toThrow(/Invalid regular expression/)
  })

  it('replaces with capture groups', () => {
    expect(replaceInLines(['john smith', 'jane doe'], '(\\w+) (\\w+)', '$2, $1')).toEqual(['smith, john', 'doe, jane'])
    expect(replaceInLines(['a-a', 'A'], 'a', 'b', { ignoreCase: true })).toEqual(['b-b', 'b'])
    expect(() => replaceInLines(['a'], '', 'b')).toThrow(/Enter a regular expression/)
  })
})
