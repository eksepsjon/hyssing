/** Line, word and JSON diffs. Everything is computed locally with Myers' algorithm. */
import { parseJson } from './json'
import { splitLines } from './lines'

type Op = 'equal' | 'remove' | 'add'

/** Beyond this many differing items the diff stops looking for matches and replaces the rest wholesale. */
const maxEdits = 2000

/**
 * The shortest edit script turning `a` into `b`, one op per item: equal consumes one item of each,
 * remove one of `a`, add one of `b`. Items are compared by their key.
 */
export function editScript(a: string[], b: string[]): Op[] {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  // Compare small integers instead of strings in the inner loop.
  const ids = new Map<string, number>()
  const id = (item: string) => ids.get(item) ?? ids.set(item, ids.size).get(item)!
  const middle =
    myers(a.slice(start, endA).map(id), b.slice(start, endB).map(id)) ??
    [...Array<Op>(endA - start).fill('remove'), ...Array<Op>(endB - start).fill('add')]

  return [...Array<Op>(start).fill('equal'), ...middle, ...Array<Op>(a.length - endA).fill('equal')]
}

function myers(a: number[], b: number[]): Op[] | undefined {
  const n = a.length
  const m = b.length
  const offset = n + m + 1
  const v = new Int32Array(2 * offset + 1)
  // trace[d] is the furthest x on each diagonal -d..d before step d.
  const trace: Int32Array[] = []

  for (let d = 0; d <= Math.min(n + m, maxEdits); d++) {
    trace.push(v.slice(offset - d, offset + d + 1))
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) return backtrack(trace, n, m)
    }
  }
  return undefined
}

function backtrack(trace: Int32Array[], n: number, m: number): Op[] {
  const ops: Op[] = []
  let x = n
  let y = m
  for (let d = trace.length - 1; d > 0; d--) {
    const v = trace[d]
    const k = x - y
    const prevK = k === -d || (k !== d && v[k - 1 + d] < v[k + 1 + d]) ? k + 1 : k - 1
    const prevX = v[prevK + d]
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      ops.push('equal')
      x--
      y--
    }
    ops.push(x === prevX ? 'add' : 'remove')
    x = prevX
    y = prevY
  }
  while (x-- > 0) ops.push('equal')
  return ops.reverse()
}

export interface Segment {
  text: string
  changed: boolean
}

export interface DiffLine {
  type: Op
  text: string
  /** 1-based line number in the original, absent for added lines. */
  oldNo?: number
  /** 1-based line number in the changed text, absent for removed lines. */
  newNo?: number
  /** The line split into changed and unchanged words, for lines that were edited rather than replaced. */
  segments?: Segment[]
}

export interface TextDiffOptions {
  ignoreCase?: boolean
  ignoreWhitespace?: boolean
}

function lineKey({ ignoreCase, ignoreWhitespace }: TextDiffOptions) {
  return (line: string) => {
    let key = ignoreWhitespace ? line.replace(/\s+/g, '') : line
    if (ignoreCase) key = key.toLowerCase()
    return key
  }
}

const toLines = (text: string) => (text === '' ? [] : splitLines(text).lines)

/** Line-by-line diff of two texts, with word-level detail for edited lines. */
export function diffText(before: string, after: string, options: TextDiffOptions = {}): DiffLine[] {
  const a = toLines(before)
  const b = toLines(after)
  const key = lineKey(options)
  const result: DiffLine[] = []
  let i = 0
  let j = 0
  let removed: DiffLine[] = []
  let added: DiffLine[] = []

  // Removed lines followed by added lines are paired up in order with the next line that is similar
  // enough (looking a few lines ahead), so each pair shows which words changed.
  const flush = () => {
    let next = 0
    for (const line of added) {
      for (let r = next; r < Math.min(removed.length, next + pairLookahead); r++) {
        const [oldSegments, newSegments] = diffWords(removed[r].text, line.text)
        if (similarity(oldSegments, newSegments) >= 0.5) {
          removed[r].segments = oldSegments
          line.segments = newSegments
          next = r + 1
          break
        }
      }
      if (next >= removed.length) break
    }
    result.push(...removed, ...added)
    removed = []
    added = []
  }

  for (const op of editScript(a.map(key), b.map(key))) {
    if (op === 'remove') {
      if (added.length) flush()
      removed.push({ type: 'remove', text: a[i], oldNo: ++i })
    } else if (op === 'add') {
      added.push({ type: 'add', text: b[j], newNo: ++j })
    } else {
      flush()
      result.push({ type: 'equal', text: b[j], oldNo: ++i, newNo: ++j })
    }
  }
  flush()
  return result
}

const pairLookahead = 20

/** The share of both lines' characters that is unchanged, from 0 to 1. */
function similarity(oldSegments: Segment[], newSegments: Segment[]): number {
  const length = (segments: Segment[], changed?: boolean) =>
    segments.filter((s) => changed === undefined || s.changed === changed).reduce((sum, s) => sum + s.text.length, 0)
  const total = length(oldSegments) + length(newSegments)
  return total === 0 ? 1 : (length(oldSegments, false) + length(newSegments, false)) / total
}

/** Words, runs of whitespace, and single other characters. */
const tokenize = (text: string) => text.match(/\w+|\s+|[^\w\s]/gu) ?? []

/** Splits two versions of a line into the parts they share and the parts that differ. */
export function diffWords(before: string, after: string): [Segment[], Segment[]] {
  const a = tokenize(before)
  const b = tokenize(after)
  const oldSegments: Segment[] = []
  const newSegments: Segment[] = []
  const push = (segments: Segment[], text: string, changed: boolean) => {
    const last = segments.at(-1)
    if (last && last.changed === changed) last.text += text
    else segments.push({ text, changed })
  }
  let i = 0
  let j = 0
  for (const op of editScript(a, b)) {
    if (op !== 'add') push(oldSegments, a[i++], op === 'remove')
    if (op !== 'remove') push(newSegments, b[j++], op === 'add')
  }
  return [oldSegments, newSegments]
}

export interface DiffStats {
  added: number
  removed: number
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return {
    added: lines.filter((line) => line.type === 'add').length,
    removed: lines.filter((line) => line.type === 'remove').length,
  }
}

export type DiffRow = DiffLine | { type: 'skip'; count: number }

/** The changed lines with `context` unchanged lines around each, and the rest collapsed into skips. */
export function withContext(lines: DiffLine[], context = 3): DiffRow[] {
  const keep = lines.map(() => false)
  lines.forEach((line, index) => {
    if (line.type === 'equal') return
    for (let k = Math.max(0, index - context); k <= Math.min(lines.length - 1, index + context); k++) keep[k] = true
  })
  const rows: DiffRow[] = []
  let skipped = 0
  lines.forEach((line, index) => {
    if (keep[index]) {
      if (skipped) rows.push({ type: 'skip', count: skipped })
      skipped = 0
      rows.push(line)
    } else {
      skipped++
    }
  })
  if (skipped) rows.push({ type: 'skip', count: skipped })
  return rows
}

/** The diff as a unified patch, as `diff -u` or `git diff` would print it. */
export function unifiedDiff(lines: DiffLine[], context = 3, oldName = 'original', newName = 'changed'): string {
  if (!lines.some((line) => line.type !== 'equal')) return ''
  const out = [`--- ${oldName}`, `+++ ${newName}`]
  const rows = withContext(lines, context)
  let index = 0
  while (index < rows.length) {
    if (rows[index].type === 'skip') {
      index++
      continue
    }
    const hunk: DiffLine[] = []
    while (index < rows.length && rows[index].type !== 'skip') hunk.push(rows[index++] as DiffLine)
    out.push(hunkHeader(hunk, lines))
    for (const line of hunk) out.push((line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ') + line.text)
  }
  return out.join('\n') + '\n'
}

function hunkHeader(hunk: DiffLine[], all: DiffLine[]): string {
  const oldLines = hunk.filter((line) => line.type !== 'add').length
  const newLines = hunk.filter((line) => line.type !== 'remove').length
  // A hunk that only adds or only removes starts at the line before it in the other file.
  const position = all.indexOf(hunk[0])
  const linesBefore = (side: 'oldNo' | 'newNo') => all.slice(0, position).filter((line) => line[side] !== undefined).length
  const oldStart = oldLines ? hunk.find((line) => line.oldNo)!.oldNo! : linesBefore('oldNo')
  const newStart = newLines ? hunk.find((line) => line.newNo)!.newNo! : linesBefore('newNo')
  return `@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`
}

export interface JsonChange {
  kind: 'added' | 'removed' | 'changed'
  /** Where the change is, e.g. `$.items[2].name`. */
  path: string
  before?: unknown
  after?: unknown
}

export interface JsonDiffOptions {
  /** Treat arrays as sets: items match wherever they are. */
  ignoreArrayOrder?: boolean
}

/** Serializes with object keys sorted, so equal values give equal strings. */
export function canonicalJson(value: unknown, indent?: string | number): string {
  return JSON.stringify(sortKeys(value), null, indent)
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    )
  }
  return value
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const keyPath = (path: string, key: string) => (/^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`)

/** Parses both texts as JSON and lists what was added, removed and changed. */
export function diffJson(before: string, after: string, options: JsonDiffOptions = {}): JsonChange[] {
  const parse = (text: string, name: string) => {
    try {
      return parseJson(text)
    } catch (e) {
      throw new Error(`${name}: ${(e as Error).message}`)
    }
  }
  const changes: JsonChange[] = []
  compare(parse(before, 'Original'), parse(after, 'Changed'), '$', options, changes)
  return changes
}

function compare(a: unknown, b: unknown, path: string, options: JsonDiffOptions, changes: JsonChange[]) {
  if (isObject(a) && isObject(b)) {
    for (const key of Object.keys(a)) {
      if (!Object.hasOwn(b, key)) changes.push({ kind: 'removed', path: keyPath(path, key), before: a[key] })
      else compare(a[key], b[key], keyPath(path, key), options, changes)
    }
    for (const key of Object.keys(b)) {
      if (!Object.hasOwn(a, key)) changes.push({ kind: 'added', path: keyPath(path, key), after: b[key] })
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    compareArrays(a, b, path, options, changes)
  } else if (canonicalJson(a) !== canonicalJson(b)) {
    changes.push({ kind: 'changed', path, before: a, after: b })
  }
}

/**
 * Matches array items by content, so inserting one item reports one addition rather than a change to
 * every item after it. Unmatched items that sit where another was removed are compared field by field.
 */
function compareArrays(a: unknown[], b: unknown[], path: string, options: JsonDiffOptions, changes: JsonChange[]) {
  const keyed = (items: unknown[]) => items.map((item, index) => ({ item, index, key: canonicalJson(item) }))
  let left = keyed(a)
  let right = keyed(b)
  if (options.ignoreArrayOrder) {
    const byKey = (x: { key: string }, y: { key: string }) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0)
    left = left.sort(byKey)
    right = right.sort(byKey)
  }

  let i = 0
  let j = 0
  let removed: typeof left = []
  let added: typeof right = []
  const flush = () => {
    const paired = options.ignoreArrayOrder ? 0 : Math.min(removed.length, added.length)
    for (let p = 0; p < paired; p++) compare(removed[p].item, added[p].item, `${path}[${added[p].index}]`, options, changes)
    for (const { item, index } of removed.slice(paired)) changes.push({ kind: 'removed', path: `${path}[${index}]`, before: item })
    for (const { item, index } of added.slice(paired)) changes.push({ kind: 'added', path: `${path}[${index}]`, after: item })
    removed = []
    added = []
  }
  for (const op of editScript(
    left.map((x) => x.key),
    right.map((x) => x.key),
  )) {
    if (op === 'remove') {
      if (added.length) flush()
      removed.push(left[i++])
    } else if (op === 'add') {
      added.push(right[j++])
    } else {
      flush()
      i++
      j++
    }
  }
  flush()
}
