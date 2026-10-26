import { describe, expect, it } from 'vitest'
import {
  getPath,
  jsonEscape,
  jsonFilter,
  jsonGet,
  jsonKeys,
  jsonLength,
  jsonMap,
  jsonPick,
  jsonSort,
  jsonToCsv,
  jsonUnescape,
  linesToJson,
  parsePath,
  renderTemplate,
} from './jsonOps'

const people = JSON.stringify([
  { name: 'Åse', age: 41, address: { city: 'Oslo' }, tags: ['a', 'b'] },
  { name: 'Bob', age: 9, address: { city: 'Bergen, Norway' } },
  { name: 'Cid', age: 30 },
])

describe('paths', () => {
  it('parses dots, brackets, quotes and wildcards', () => {
    expect(parsePath('$.a.b[0]["x.y"][\'z\'][*].c')).toEqual(['a', 'b', 0, 'x.y', 'z', '*', 'c'])
    expect(parsePath('')).toEqual([])
    expect(() => parsePath('a[')).toThrow('Invalid path')
  })

  it('gets values', () => {
    const value = { items: [{ id: 1 }, { id: 2 }, {}], 'odd key': true }
    expect(getPath(value, 'items[-1]')).toEqual({})
    expect(getPath(value, 'items.1.id')).toBe(2)
    expect(getPath(value, 'items[*].id')).toEqual([1, 2])
    expect(getPath(value, '["odd key"]')).toBe(true)
    expect(getPath(value, 'nope.deeper')).toBeUndefined()
    expect(getPath(value, 'toString')).toBeUndefined()
  })
})

describe('JSON operations', () => {
  it('gets', () => {
    expect(jsonGet(people, '[0].address.city')).toBe('Oslo')
    expect(jsonGet(people, '[0].tags')).toBe('[\n  "a",\n  "b"\n]')
    expect(() => jsonGet(people, '[5]')).toThrow('Nothing at [5]')
    expect(() => jsonGet('{bad', '')).toThrow('Invalid JSON')
  })

  it('maps', () => {
    expect(jsonMap(people, 'name', 'lines')).toBe('Åse\nBob\nCid')
    expect(jsonMap(people, 'address.city', 'json')).toBe(JSON.stringify(['Oslo', 'Bergen, Norway', null], null, 2))
    expect(jsonMap(JSON.stringify({ data: people && JSON.parse(people) }), 'age', 'lines', 'data')).toBe('41\n9\n30')
    expect(() => jsonMap('{}', 'a', 'lines')).toThrow('Expected a JSON array')
  })

  it('maps with a template', () => {
    expect(jsonMap(people, '', 'lines', '', '{name} ({age}) – {address.city}\n')).toBe('Åse (41) – Oslo\nBob (9) – Bergen, Norway\nCid (30) – ')
    expect(renderTemplate('{{literal}} {} {tags[1]}', { tags: ['x', 'y'] })).toBe('{literal} {"tags":["x","y"]} y')
  })

  it('picks, filters and sorts', () => {
    expect(JSON.parse(jsonPick(people, 'name, address.city'))).toEqual([{ name: 'Åse', 'address.city': 'Oslo' }, { name: 'Bob', 'address.city': 'Bergen, Norway' }, { name: 'Cid' }])
    const names = (json: string) => (JSON.parse(json) as { name: string }[]).map((p) => p.name)
    expect(names(jsonFilter(people, 'age', 'greater', '20'))).toEqual(['Åse', 'Cid'])
    expect(names(jsonFilter(people, 'address', 'missing', ''))).toEqual(['Cid'])
    expect(names(jsonFilter(people, 'name', 'regex', '^[AB]'))).toEqual(['Bob'])
    expect(names(jsonFilter(people, 'address.city', 'equals', 'Oslo'))).toEqual(['Åse'])
    expect(names(jsonSort(people, 'age', false))).toEqual(['Bob', 'Cid', 'Åse'])
    expect(names(jsonSort(people, 'address.city', true))).toEqual(['Åse', 'Bob', 'Cid'])
  })

  it('lists keys and lengths', () => {
    expect(jsonKeys('{"a":1,"b":2}')).toBe('a\nb')
    expect(jsonLength(people)).toBe('3')
    expect(jsonLength(people, '[0].name')).toBe('3')
    expect(() => jsonLength('1')).toThrow('Expected an array')
  })

  it('converts', () => {
    expect(linesToJson('a\nb\n', false)).toBe('[\n  "a",\n  "b"\n]')
    expect(linesToJson('1\n{"a":2}', true)).toBe('[\n  1,\n  {\n    "a": 2\n  }\n]')
    expect(() => linesToJson('1\nx', true)).toThrow('Line 2 is not JSON')
    expect(jsonToCsv(people)).toBe('name,age,address,tags\nÅse,41,"{""city"":""Oslo""}","[""a"",""b""]"\nBob,9,"{""city"":""Bergen, Norway""}",\nCid,30,,')
    expect(jsonUnescape(jsonEscape('say "hi"\n'))).toBe('say "hi"\n')
    expect(() => jsonUnescape('1')).toThrow('Expected a JSON string')
  })
})
