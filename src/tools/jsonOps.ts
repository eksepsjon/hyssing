/** Operations on text that is assumed to be JSON: it is parsed first, and errors say so. */
import { parseJson } from './json'

export type PathSegment = string | number | '*'

/**
 * Parses a path such as `items[0].name`, `$.data["first name"]` or `items[*].id`.
 * A leading `$` or `.` is optional; an empty path is the whole value; `*` is every element or value.
 */
export function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = []
  let rest = path.trim().replace(/^\$/, '')
  while (rest) {
    let match: RegExpMatchArray | null
    if ((match = rest.match(/^\.?([^.[\]]+)/))) {
      segments.push(match[1] === '*' ? '*' : match[1])
    } else if ((match = rest.match(/^\[\s*(-?\d+)\s*\]/))) {
      segments.push(Number(match[1]))
    } else if ((match = rest.match(/^\[\s*\*\s*\]/))) {
      segments.push('*')
    } else if ((match = rest.match(/^\[\s*("(?:[^"\\]|\\.)*")\s*\]/))) {
      segments.push(JSON.parse(match[1]) as string)
    } else if ((match = rest.match(/^\[\s*'([^']*)'\s*\]/))) {
      segments.push(match[1])
    } else {
      throw new Error(`Invalid path near: ${rest.slice(0, 20)}`)
    }
    rest = rest.slice(match[0].length)
  }
  return segments
}

function step(value: unknown, segment: string | number): unknown {
  if (Array.isArray(value)) {
    const index = typeof segment === 'number' ? segment : /^-?\d+$/.test(segment) ? Number(segment) : NaN
    return Number.isNaN(index) ? undefined : value.at(index)
  }
  if (typeof value === 'object' && value !== null && Object.hasOwn(value, segment)) {
    return (value as Record<string, unknown>)[segment]
  }
  return undefined
}

/** The value at `path`, or undefined when there is nothing there. A `*` gives an array of matches. */
export function getPath(value: unknown, path: string | PathSegment[]): unknown {
  const segments = typeof path === 'string' ? parsePath(path) : path
  let current = value
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment === '*') {
      const items = Array.isArray(current) ? current : typeof current === 'object' && current !== null ? Object.values(current) : []
      const rest = segments.slice(i + 1)
      return items.map((item) => getPath(item, rest)).filter((item) => item !== undefined)
    }
    current = step(current, segment)
    if (current === undefined) return undefined
  }
  return current
}

/** Strings as they are, nothing as empty, anything else as JSON. */
export function toText(value: unknown, indent: string | number = 2): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, indent)
}

function requireArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Expected a JSON array, got ${describe(value)}`)
  return value
}

function describe(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'an array'
  return typeof value === 'object' ? 'an object' : `a ${typeof value}`
}

/** The array at `arrayPath` (default: the whole input). */
function arrayAt(input: string, arrayPath = ''): unknown[] {
  const root = parseJson(input)
  const value = getPath(root, arrayPath)
  if (value === undefined) throw new Error(`Nothing at ${arrayPath}`)
  return requireArray(value)
}

export function jsonGet(input: string, path: string): string {
  const value = getPath(parseJson(input), path)
  if (value === undefined) throw new Error(`Nothing at ${path || 'the root'}`)
  return toText(value)
}

export type ListOutput = 'lines' | 'json'

/**
 * Fills `{path}` placeholders with values from `value`: `{name}`, `{address.city}`, `{tags[0]}`;
 * `{}` is the whole value. Missing values become empty; `{{` and `}}` give literal braces.
 */
export function renderTemplate(template: string, value: unknown): string {
  return template.replace(/\{\{|\}\}|\{([^{}]*)\}/g, (match, path: string | undefined) => {
    if (path === undefined) return match[0]
    return toText(getPath(value, path), 0)
  })
}

/**
 * Turns every element of the array into text: the value at `path`, or, when a template is given,
 * the template filled from the element. The results come as lines or as a JSON array.
 */
export function jsonMap(input: string, path: string, output: ListOutput, arrayPath = '', template = ''): string {
  const items = arrayAt(input, arrayPath)
  if (template) {
    // One trailing newline ends the template rather than adding a blank line after every element.
    const body = template.replace(/\r?\n$/, '')
    const rendered = items.map((item) => renderTemplate(body, item))
    return output === 'json' ? JSON.stringify(rendered, null, 2) : rendered.join('\n')
  }
  const segments = parsePath(path)
  const values = items.map((item) => getPath(item, segments))
  return output === 'json' ? JSON.stringify(values.map((v) => v ?? null), null, 2) : values.map((v) => toText(v, 0)).join('\n')
}

/** Keeps only the given comma-separated fields of every object in the array. */
export function jsonPick(input: string, fields: string, arrayPath = ''): string {
  const paths = fields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
  const pick = (item: unknown) =>
    Object.fromEntries(paths.map((path) => [path, getPath(item, path)] as const).filter(([, value]) => value !== undefined))
  const root = parseJson(input)
  const value = getPath(root, arrayPath)
  return JSON.stringify(Array.isArray(value) ? value.map(pick) : pick(value), null, 2)
}

export type FilterOperator = 'equals' | 'notEquals' | 'contains' | 'regex' | 'greater' | 'less' | 'exists' | 'missing'

export function jsonFilter(input: string, path: string, operator: FilterOperator, expected: string, arrayPath = ''): string {
  const segments = parsePath(path)
  const regex = operator === 'regex' ? new RegExp(expected) : undefined
  const keep = (item: unknown) => {
    const value = getPath(item, segments)
    const text = toText(value, 0)
    switch (operator) {
      case 'equals':
        return value !== undefined && text === expected
      case 'notEquals':
        return text !== expected
      case 'contains':
        return text.includes(expected)
      case 'regex':
        return value !== undefined && regex!.test(text)
      case 'greater':
        return value !== undefined && Number(text) > Number(expected)
      case 'less':
        return value !== undefined && Number(text) < Number(expected)
      case 'exists':
        return value !== undefined && value !== null
      case 'missing':
        return value === undefined || value === null
    }
  }
  return JSON.stringify(arrayAt(input, arrayPath).filter(keep), null, 2)
}

const collator = new Intl.Collator(undefined, { numeric: true })

/** Sorts the array by the value at `path`: numbers numerically, other values as text; missing values last. */
export function jsonSort(input: string, path: string, descending: boolean, arrayPath = ''): string {
  const segments = parsePath(path)
  const keyed = arrayAt(input, arrayPath).map((item) => ({ item, key: getPath(item, segments) }))
  const compare = (a: unknown, b: unknown) =>
    typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(toText(a, 0), toText(b, 0))
  keyed.sort((a, b) => {
    if (a.key === undefined || b.key === undefined) return a.key === undefined ? (b.key === undefined ? 0 : 1) : -1
    return descending ? compare(b.key, a.key) : compare(a.key, b.key)
  })
  return JSON.stringify(
    keyed.map(({ item }) => item),
    null,
    2,
  )
}

export function jsonKeys(input: string, path = ''): string {
  const value = getPath(parseJson(input), path)
  if (Array.isArray(value)) return value.map((_, i) => String(i)).join('\n')
  if (typeof value !== 'object' || value === null) throw new Error(`Expected a JSON object, got ${describe(value)}`)
  return Object.keys(value).join('\n')
}

export function jsonLength(input: string, path = ''): string {
  const value = getPath(parseJson(input), path)
  if (Array.isArray(value) || typeof value === 'string') return String(value.length)
  if (typeof value === 'object' && value !== null) return String(Object.keys(value).length)
  throw new Error(`Expected an array, object or string, got ${describe(value)}`)
}

/** Lines become a JSON array of strings (or of parsed values, when every line is JSON). */
export function linesToJson(input: string, parse: boolean): string {
  const lines = input.replace(/\r?\n$/, '').split(/\r?\n/)
  const values = lines.map((line, i) => {
    if (!parse) return line
    try {
      return JSON.parse(line)
    } catch {
      throw new Error(`Line ${i + 1} is not JSON: ${line.slice(0, 40)}`)
    }
  })
  return JSON.stringify(input === '' ? [] : values, null, 2)
}

/** An array of objects as CSV, with a column for every key seen. Nested values are written as JSON. */
export function jsonToCsv(input: string, separator = ',', arrayPath = ''): string {
  const rows = arrayAt(input, arrayPath).map((item) => (typeof item === 'object' && item !== null && !Array.isArray(item) ? item : { value: item }))
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  const cell = (value: unknown) => {
    const text = toText(value, 0)
    return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [columns.map(cell), ...rows.map((row) => columns.map((column) => cell((row as Record<string, unknown>)[column])))]
    .map((cells) => cells.join(separator))
    .join('\n')
}

/** Text as a JSON string literal, quotes and escapes included. */
export function jsonEscape(input: string): string {
  return JSON.stringify(input)
}

/** A JSON string literal back to its text. */
export function jsonUnescape(input: string): string {
  const value = parseJson(input.trim())
  if (typeof value !== 'string') throw new Error(`Expected a JSON string, got ${describe(value)}`)
  return value
}
