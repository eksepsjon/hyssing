import { describe, expect, it } from 'vitest'
import { diffJson, diffText, diffWords, editScript, unifiedDiff, withContext } from './diff'

const render = (before: string, after: string, options = {}) =>
  diffText(before, after, options).map((line) => (line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ') + line.text)

describe('editScript', () => {
  it('finds a shortest edit', () => {
    const a = 'ABCABBA'.split('')
    const b = 'CBABAC'.split('')
    const ops = editScript(a, b)
    expect(ops.filter((op) => op !== 'equal')).toHaveLength(5)
    // Applying the script to a gives b.
    let i = 0
    let j = 0
    for (const op of ops) {
      if (op === 'equal') expect(a[i++]).toBe(b[j++])
      else if (op === 'remove') i++
      else j++
    }
    expect([i, j]).toEqual([a.length, b.length])
  })
  it('handles empty sides', () => {
    expect(editScript([], [])).toEqual([])
    expect(editScript(['a'], [])).toEqual(['remove'])
    expect(editScript([], ['a'])).toEqual(['add'])
  })
  it('falls back to replacing everything when the inputs share nothing and are huge', () => {
    const a = Array.from({ length: 3000 }, (_, i) => `a${i}`)
    const b = Array.from({ length: 3000 }, (_, i) => `b${i}`)
    const ops = editScript(a, b)
    expect(ops.filter((op) => op === 'remove')).toHaveLength(3000)
    expect(ops.filter((op) => op === 'add')).toHaveLength(3000)
  })
})

describe('diffText', () => {
  it('diffs lines with line numbers', () => {
    expect(render('a\nb\nc', 'a\nx\nc\nd')).toEqual([' a', '-b', '+x', ' c', '+d'])
    const lines = diffText('a\nb', 'b')
    expect(lines).toMatchObject([
      { type: 'remove', oldNo: 1 },
      { type: 'equal', oldNo: 2, newNo: 1 },
    ])
  })
  it('ignores a trailing newline and CRLF', () => {
    expect(render('a\r\nb\n', 'a\nb')).toEqual([' a', ' b'])
  })
  it('can ignore case and whitespace', () => {
    expect(render('Hello  World', 'hello world', { ignoreCase: true })).toEqual(['-Hello  World', '+hello world'])
    expect(render('Hello  World', 'hello world', { ignoreCase: true, ignoreWhitespace: true })).toEqual([' hello world'])
  })
  it('highlights changed words in edited lines', () => {
    const [removed, added] = diffText('the quick fox', 'the slow fox')
    expect(removed.segments).toEqual([
      { text: 'the ', changed: false },
      { text: 'quick', changed: true },
      { text: ' fox', changed: false },
    ])
    expect(added.segments?.find((s) => s.changed)?.text).toBe('slow')
  })
  it('pairs each edited line with a similar one', () => {
    const lines = diffText('beta\ngamma line here', 'gamma line there')
    expect(lines[0].segments).toBeUndefined()
    expect(lines[1].segments).toBeDefined()
    expect(lines[2].segments?.find((s) => s.changed)?.text).toBe('there')
  })
  it('does not highlight lines that share nothing', () => {
    const [removed] = diffText('abc', 'xyz')
    expect(removed.segments).toBeUndefined()
  })
})

describe('diffWords', () => {
  it('splits on words and punctuation', () => {
    const [, after] = diffWords('f(a, b)', 'f(a, c)')
    expect(after).toEqual([
      { text: 'f(a, ', changed: false },
      { text: 'c', changed: true },
      { text: ')', changed: false },
    ])
  })
})

describe('context and patches', () => {
  const before = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n')
  const after = before.replace('line 10', 'line ten')
  const lines = diffText(before, after)

  it('collapses unchanged lines', () => {
    const rows = withContext(lines, 2)
    expect(rows[0]).toEqual({ type: 'skip', count: 7 })
    expect(rows.at(-1)).toEqual({ type: 'skip', count: 8 })
    expect(rows).toHaveLength(8)
  })
  it('prints a unified diff', () => {
    expect(unifiedDiff(lines, 1)).toBe(
      ['--- original', '+++ changed', '@@ -9,3 +9,3 @@', ' line 9', '-line 10', '+line ten', ' line 11', ''].join('\n'),
    )
    expect(unifiedDiff(diffText('a', 'a'))).toBe('')
  })
  it('numbers pure insertions from the line before', () => {
    expect(unifiedDiff(diffText('', 'new'))).toBe(['--- original', '+++ changed', '@@ -0,0 +1,1 @@', '+new', ''].join('\n'))
  })
})

describe('diffJson', () => {
  it('lists added, removed and changed values by path', () => {
    expect(
      diffJson('{"name":"Ada","age":36,"old":true,"nested":{"x":1}}', '{"age":37,"name":"Ada","nested":{"x":1,"first name":"A"},"new":null}'),
    ).toEqual([
      { kind: 'changed', path: '$.age', before: 36, after: 37 },
      { kind: 'removed', path: '$.old', before: true },
      { kind: 'added', path: '$.nested["first name"]', after: 'A' },
      { kind: 'added', path: '$.new', after: null },
    ])
  })
  it('ignores key order and reports type changes', () => {
    expect(diffJson('{"a":1,"b":{"c":2,"d":3}}', '{"b":{"d":3,"c":2},"a":1}')).toEqual([])
    expect(diffJson('{"a":1}', '{"a":"1"}')).toEqual([{ kind: 'changed', path: '$.a', before: 1, after: '1' }])
  })
  it('matches array items so an insertion is one change', () => {
    expect(diffJson('[1,2,3]', '[1,9,2,3]')).toEqual([{ kind: 'added', path: '$[1]', after: 9 }])
    expect(diffJson('[{"id":1,"n":"a"},{"id":2}]', '[{"id":1,"n":"b"},{"id":2}]')).toEqual([
      { kind: 'changed', path: '$[0].n', before: 'a', after: 'b' },
    ])
  })
  it('can ignore array order', () => {
    expect(diffJson('[1,2,3]', '[3,1,2]')).not.toEqual([])
    expect(diffJson('[1,2,3]', '[3,1,2]', { ignoreArrayOrder: true })).toEqual([])
    expect(diffJson('[1,2]', '[2,4]', { ignoreArrayOrder: true })).toEqual([
      { kind: 'removed', path: '$[0]', before: 1 },
      { kind: 'added', path: '$[1]', after: 4 },
    ])
  })
  it('says which side is invalid', () => {
    expect(() => diffJson('{}', '{a}')).toThrow(/^Changed: Invalid JSON/)
  })
})
