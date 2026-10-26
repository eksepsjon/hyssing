import { decodeBase64, encodeBase64 } from '../tools/base64'
import { dateTokens, formatDate } from '../tools/dateFormat'
import { fetchMethods, fetchText, formatResponse } from '../tools/fetch'
import { formatJson, minifyJson } from '../tools/json'
import {
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
  type FilterOperator,
  type ListOutput,
} from '../tools/jsonOps'
import { decodeJwt } from '../tools/jwt'
import {
  filterLines,
  joinLines,
  removeEmptyLines,
  replaceInLines,
  reverseLines,
  seededRandom,
  shuffleLines,
  sortLines,
  sortLocales,
  splitLines,
  uniqueLines,
} from '../tools/lines'
import { formatMarkdown } from '../tools/markdown'
import { parseTime } from '../tools/time'
import { formatXml, minifyXml } from '../tools/xml'

export type ParamValue = string | boolean

export type ParamDef =
  | {
      key: string
      label: string
      kind: 'text' | 'textarea'
      default: string
      placeholder?: string
      hint?: string
      /** Index of an input port that supplies this value instead when connected. */
      fromInput?: number
    }
  | { key: string; label: string; kind: 'checkbox'; default: boolean }
  | { key: string; label: string; kind: 'select'; default: string; options: { value: string; label: string }[] }

export type Params = Record<string, ParamValue>

export interface NodeTypeDef {
  type: string
  label: string
  category: string
  /** Names of the input ports, in order. Source nodes have none. */
  inputs: string[]
  /** Ports that may stay unconnected; they then give an empty string and `connected[port]` is false. */
  optionalInputs?: number[]
  params: ParamDef[]
  /** True for nodes whose output changes with the clock; the pipeline then re-runs every second. */
  live?: boolean
  /** Label of a button on the node; the node only does its work once it has been clicked. */
  action?: string
  run: (inputs: string[], params: Params, context: RunContext) => string | Promise<string>
}

export interface RunContext {
  now: Date
  /** Whether each input port is connected; only meaningful for optional inputs. */
  connected: boolean[]
  /** How often the node's action button was clicked; 0 until it is. */
  clicks: number
  /**
   * Runs `work` once per click and reuses its result on later runs, as long as `key` (what the work
   * depends on) stays the same. If `key` changes without a new click, the node waits for one.
   */
  oncePerClick: <T>(key: string, work: () => Promise<T>) => Promise<T>
}

/** Thrown by a node that cannot run yet; it is shown as waiting rather than as an error. */
export class WaitingError extends Error {}

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

/** "local" is resolved per viewer, so a shared pipeline shows the opener's own time zone. */
function resolveZone(zone: string): string {
  return zone === 'local' ? localZone : zone
}

const timeZone: ParamDef = {
  key: 'timeZone',
  label: 'Time zone',
  kind: 'select',
  default: 'local',
  options: [
    { value: 'local', label: `Local (${localZone})` },
    { value: 'UTC', label: 'UTC' },
    ...(Intl.supportedValuesOf?.('timeZone') ?? []).filter((zone) => zone !== 'UTC').map((zone) => ({ value: zone, label: zone })),
  ],
}

const datePattern: ParamDef = {
  key: 'pattern',
  label: 'Format',
  kind: 'text',
  default: 'YYYY-MM-DD HH:mm:ss',
  hint: [...dateTokens.map(([token, meaning]) => `${token}: ${meaning}`), '[text]: kept as is'].join('; '),
}

const dateLocale: ParamDef = {
  key: 'locale',
  label: 'Language',
  kind: 'select',
  default: 'en',
  options: [
    { value: 'en', label: 'English' },
    { value: 'nb', label: 'Norwegian' },
    { value: 'da', label: 'Danish' },
    { value: 'sv', label: 'Swedish' },
    { value: 'fi', label: 'Finnish' },
    { value: 'de', label: 'German' },
  ],
}

const indent: ParamDef = {
  key: 'indent',
  label: 'Indent',
  kind: 'select',
  default: '  ',
  options: [
    { value: '  ', label: '2 spaces' },
    { value: '    ', label: '4 spaces' },
    { value: '\t', label: 'Tab' },
  ],
}
const ignoreCase: ParamDef = { key: 'ignoreCase', label: 'Ignore case', kind: 'checkbox', default: false }

const pathHint = 'a.b: field b of object a; items[0]: first element; items[-1]: last element; items[*].id: id of every element; ["odd key"]: a key with spaces or dots; empty: the whole value'

function jsonPath(key: string, label: string, placeholder: string): ParamDef {
  return { key, label, kind: 'text', default: '', placeholder, hint: pathHint }
}

/** Where the array is inside the input; empty when the input is the array itself. */
const arrayPath: ParamDef = { key: 'arrayPath', label: 'Array at', kind: 'text', default: '', placeholder: '(whole input)' }

const listOutput: ParamDef = {
  key: 'output',
  label: 'Output',
  kind: 'select',
  default: 'lines',
  options: [
    { value: 'lines', label: 'One per line' },
    { value: 'json', label: 'JSON array' },
  ],
}

/** Runs a line operation, keeping a trailing newline if the input had one. */
function perLine(operation: (lines: string[], params: Params) => string[]) {
  return ([input]: string[], params: Params) => {
    const split = splitLines(input)
    return joinLines({ ...split, lines: operation(split.lines, params) })
  }
}

const sortParams: ParamDef[] = [
  { key: 'order', label: 'Order', kind: 'select', default: 'asc', options: [{ value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }] },
  { key: 'locale', label: 'Alphabet', kind: 'select', default: 'nb', options: sortLocales },
  { key: 'natural', label: 'Natural number order', kind: 'checkbox', default: true },
  ignoreCase,
]

export const nodeTypes: NodeTypeDef[] = [
  {
    type: 'input',
    label: 'Input',
    category: 'Source',
    inputs: [],
    params: [{ key: 'text', label: 'Text', kind: 'textarea', default: '', placeholder: 'Type or paste text…' }],
    run: (_, params) => params.text as string,
  },
  {
    type: 'now',
    label: 'Current time',
    category: 'Source',
    inputs: [],
    live: true,
    params: [
      {
        key: 'as',
        label: 'As',
        kind: 'select',
        default: 'iso',
        options: [
          { value: 'iso', label: 'ISO 8601 (UTC)' },
          { value: 'unix', label: 'Unix seconds' },
          { value: 'unixMs', label: 'Unix milliseconds' },
        ],
      },
    ],
    run: (_, params, { now }) =>
      params.as === 'unix' ? String(Math.floor(now.getTime() / 1000)) : params.as === 'unixMs' ? String(now.getTime()) : now.toISOString(),
  },
  {
    type: 'fetch',
    label: 'Fetch URL',
    category: 'Source',
    // Both optional: "url" replaces the URL field, "body" is sent with POST/PUT/PATCH.
    inputs: ['url', 'body'],
    optionalInputs: [0, 1],
    action: 'Fetch',
    params: [
      { key: 'url', label: 'URL', kind: 'text', default: '', placeholder: 'https://…', fromInput: 0 },
      { key: 'method', label: 'Method', kind: 'select', default: 'GET', options: fetchMethods.map((method) => ({ value: method, label: method })) },
      {
        key: 'output',
        label: 'Output',
        kind: 'select',
        default: 'body',
        options: [
          { value: 'body', label: 'Body' },
          { value: 'full', label: 'Status, headers and body' },
        ],
      },
    ],
    run: async ([urlInput, body], p, { connected, clicks, oncePerClick }) => {
      // A trailing newline from an upstream node is not part of the URL.
      const url = (connected[0] ? urlInput : (p.url as string)).trim()
      if (!url) throw new WaitingError('Enter a URL')
      if (!clicks) throw new WaitingError('Click Fetch to load')
      const method = p.method as string
      const response = await oncePerClick(JSON.stringify([url, method, body]), () => fetchText(url, method, body))
      if (p.output === 'full') return formatResponse(response)
      if (response.status >= 400) throw new Error(`${response.status} ${response.statusText}`.trim())
      return response.body
    },
  },
  {
    type: 'concat',
    label: 'Concat',
    category: 'Combine',
    inputs: ['A', 'B'],
    params: [{ key: 'separator', label: 'Separator (\\n for newline)', kind: 'text', default: '\\n' }],
    run: ([a, b], params) => a + (params.separator as string).replace(/\\n/g, '\n').replace(/\\t/g, '\t') + b,
  },
  { type: 'base64Encode', label: 'Base64 encode', category: 'Encode', inputs: ['in'], params: [{ key: 'urlSafe', label: 'URL-safe', kind: 'checkbox', default: false }], run: ([input], p) => encodeBase64(input, p.urlSafe as boolean) },
  { type: 'base64Decode', label: 'Base64 decode', category: 'Encode', inputs: ['in'], params: [], run: ([input]) => decodeBase64(input) },
  { type: 'jwtDecode', label: 'JWT decode', category: 'Encode', inputs: ['in'], params: [{ key: 'part', label: 'Part', kind: 'select', default: 'payload', options: [{ value: 'payload', label: 'Payload' }, { value: 'header', label: 'Header' }] }], run: ([input], p) => JSON.stringify(decodeJwt(input)[p.part as 'payload' | 'header'], null, 2) },
  { type: 'jsonFormat', label: 'JSON format', category: 'Format', inputs: ['in'], params: [indent], run: ([input], p) => formatJson(input, p.indent as string) },
  { type: 'jsonMinify', label: 'JSON minify', category: 'Format', inputs: ['in'], params: [], run: ([input]) => minifyJson(input) },
  { type: 'xmlFormat', label: 'XML format', category: 'Format', inputs: ['in'], params: [indent], run: ([input], p) => formatXml(input, p.indent as string) },
  { type: 'xmlMinify', label: 'XML minify', category: 'Format', inputs: ['in'], params: [], run: ([input]) => minifyXml(input) },
  { type: 'markdownFormat', label: 'Markdown format', category: 'Format', inputs: ['in'], params: [], run: ([input]) => formatMarkdown(input) },
  { type: 'sort', label: 'Sort lines', category: 'Lines', inputs: ['in'], params: sortParams, run: perLine((lines, p) => sortLines(lines, { descending: p.order === 'desc', locale: p.locale as string, natural: p.natural as boolean, ignoreCase: p.ignoreCase as boolean })) },
  { type: 'unique', label: 'Remove duplicates', category: 'Lines', inputs: ['in'], params: [ignoreCase], run: perLine((lines, p) => uniqueLines(lines, { ignoreCase: p.ignoreCase as boolean })) },
  {
    type: 'shuffle',
    label: 'Shuffle lines',
    category: 'Lines',
    inputs: ['in'],
    // Seeded so the result stays put while other nodes are edited; change the seed to reshuffle.
    params: [{ key: 'seed', label: 'Seed', kind: 'text', default: '1' }],
    run: perLine((lines, p) => shuffleLines(lines, seededRandom(p.seed as string))),
  },
  { type: 'reverse', label: 'Reverse lines', category: 'Lines', inputs: ['in'], params: [], run: perLine(reverseLines) },
  { type: 'removeEmpty', label: 'Remove empty lines', category: 'Lines', inputs: ['in'], params: [], run: perLine(removeEmptyLines) },
  {
    type: 'filter',
    label: 'Filter lines',
    category: 'Lines',
    inputs: ['in'],
    params: [
      { key: 'pattern', label: 'Regex', kind: 'text', default: '', placeholder: '^error' },
      { key: 'mode', label: 'Mode', kind: 'select', default: 'keep', options: [{ value: 'keep', label: 'Keep matching' }, { value: 'remove', label: 'Remove matching' }] },
      ignoreCase,
    ],
    run: perLine((lines, p) => filterLines(lines, p.pattern as string, { keep: p.mode === 'keep', ignoreCase: p.ignoreCase as boolean })),
  },
  {
    type: 'replace',
    label: 'Replace',
    category: 'Lines',
    // "insert" is optional: connected, its text is inserted as is; otherwise "Replace with" is used.
    inputs: ['text', 'insert'],
    optionalInputs: [1],
    params: [
      { key: 'pattern', label: 'Regex', kind: 'text', default: '', placeholder: '(\\w+)@(\\w+)' },
      { key: 'replacement', label: 'Replace with', kind: 'text', default: '', placeholder: '$2 ($1)', fromInput: 1 },
      ignoreCase,
    ],
    run: ([text, insert], p, { connected }) => {
      const split = splitLines(text)
      const lines = connected[1]
        ? // One trailing newline is the end of the inserted text, not part of it.
          replaceInLines(split.lines, p.pattern as string, insert.replace(/\r?\n$/, ''), {
            ignoreCase: p.ignoreCase as boolean,
            literal: true,
          })
        : replaceInLines(split.lines, p.pattern as string, p.replacement as string, { ignoreCase: p.ignoreCase as boolean })
      return joinLines({ ...split, lines })
    },
  },
  {
    type: 'case',
    label: 'Change case',
    category: 'Lines',
    inputs: ['in'],
    params: [{ key: 'to', label: 'To', kind: 'select', default: 'upper', options: [{ value: 'upper', label: 'UPPERCASE' }, { value: 'lower', label: 'lowercase' }] }],
    run: ([input], p) => (p.to === 'upper' ? input.toLocaleUpperCase() : input.toLocaleLowerCase()),
  },
  {
    type: 'trim',
    label: 'Trim lines',
    category: 'Lines',
    inputs: ['in'],
    params: [],
    run: perLine((lines) => lines.map((line) => line.trim())),
  },
  {
    type: 'jsonGet',
    label: 'JSON get',
    category: 'JSON',
    inputs: ['in'],
    params: [jsonPath('path', 'Path', 'data.items[0]')],
    run: ([input], p) => jsonGet(input, p.path as string),
  },
  {
    type: 'jsonMap',
    label: 'JSON map',
    category: 'JSON',
    // "template" is optional: connected, it replaces the Template field.
    inputs: ['in', 'template'],
    optionalInputs: [1],
    params: [
      jsonPath('path', 'Pick', 'name'),
      {
        key: 'template',
        label: 'Template',
        kind: 'textarea',
        default: '',
        placeholder: 'Or a template, used instead of Pick:\n{name} lives in {address.city}',
        hint: '{path}: the value at path in each element, e.g. {name}, {address.city}, {tags[0]}; {}: the whole element; {{ and }}: literal braces',
        fromInput: 1,
      },
      arrayPath,
      listOutput,
    ],
    run: ([input, template], p, { connected }) =>
      jsonMap(input, p.path as string, p.output as ListOutput, p.arrayPath as string, connected[1] ? template : (p.template as string)),
  },
  {
    type: 'jsonPick',
    label: 'JSON pick fields',
    category: 'JSON',
    inputs: ['in'],
    params: [{ key: 'fields', label: 'Fields', kind: 'text', default: '', placeholder: 'id, name, address.city' }, arrayPath],
    run: ([input], p) => jsonPick(input, p.fields as string, p.arrayPath as string),
  },
  {
    type: 'jsonFilter',
    label: 'JSON filter',
    category: 'JSON',
    inputs: ['in'],
    params: [
      jsonPath('path', 'Where', 'status'),
      {
        key: 'operator',
        label: 'Is',
        kind: 'select',
        default: 'equals',
        options: [
          { value: 'equals', label: 'equal to' },
          { value: 'notEquals', label: 'not equal to' },
          { value: 'contains', label: 'containing' },
          { value: 'regex', label: 'matching regex' },
          { value: 'greater', label: 'greater than' },
          { value: 'less', label: 'less than' },
          { value: 'exists', label: 'present' },
          { value: 'missing', label: 'missing or null' },
        ],
      },
      { key: 'value', label: 'Value', kind: 'text', default: '' },
      arrayPath,
    ],
    run: ([input], p) => jsonFilter(input, p.path as string, p.operator as FilterOperator, p.value as string, p.arrayPath as string),
  },
  {
    type: 'jsonSort',
    label: 'JSON sort',
    category: 'JSON',
    inputs: ['in'],
    params: [
      jsonPath('path', 'By', 'name'),
      { key: 'order', label: 'Order', kind: 'select', default: 'asc', options: [{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }] },
      arrayPath,
    ],
    run: ([input], p) => jsonSort(input, p.path as string, p.order === 'desc', p.arrayPath as string),
  },
  { type: 'jsonKeys', label: 'JSON keys', category: 'JSON', inputs: ['in'], params: [jsonPath('path', 'Of', '(whole input)')], run: ([input], p) => jsonKeys(input, p.path as string) },
  { type: 'jsonLength', label: 'JSON length', category: 'JSON', inputs: ['in'], params: [jsonPath('path', 'Of', '(whole input)')], run: ([input], p) => jsonLength(input, p.path as string) },
  {
    type: 'jsonToCsv',
    label: 'JSON → CSV',
    category: 'JSON',
    inputs: ['in'],
    params: [
      { key: 'separator', label: 'Separator', kind: 'select', default: ',', options: [{ value: ',', label: 'Comma' }, { value: ';', label: 'Semicolon' }, { value: '\t', label: 'Tab' }] },
      arrayPath,
    ],
    run: ([input], p) => jsonToCsv(input, p.separator as string, p.arrayPath as string),
  },
  {
    type: 'linesToJson',
    label: 'Lines → JSON array',
    category: 'JSON',
    inputs: ['in'],
    params: [{ key: 'parse', label: 'Parse each line as JSON', kind: 'checkbox', default: false }],
    run: ([input], p) => linesToJson(input, p.parse as boolean),
  },
  { type: 'jsonEscape', label: 'JSON escape string', category: 'JSON', inputs: ['in'], params: [], run: ([input]) => jsonEscape(input) },
  { type: 'jsonUnescape', label: 'JSON unescape string', category: 'JSON', inputs: ['in'], params: [], run: ([input]) => jsonUnescape(input) },
  {
    type: 'dateFormat',
    label: 'Date format',
    category: 'Time',
    inputs: ['in'],
    params: [datePattern, timeZone, dateLocale],
    // Each non-empty line is a Unix timestamp or date; blank lines pass through.
    run: perLine((lines, p) =>
      lines.map((line, i) => {
        if (!line.trim()) return line
        let date: Date
        try {
          date = parseTime(line).date
        } catch {
          throw new Error(`Line ${i + 1} is not a timestamp or date: ${line.trim().slice(0, 40)}`)
        }
        return formatDate(date, p.pattern as string, resolveZone(p.timeZone as string), p.locale as string)
      }),
    ),
  },
  {
    type: 'timestampToIso',
    label: 'Timestamp → ISO',
    category: 'Time',
    inputs: ['in'],
    params: [],
    // Each non-empty line is a Unix timestamp or date; blank lines pass through.
    run: perLine((lines) =>
      lines.map((line, i) => {
        if (!line.trim()) return line
        try {
          return parseTime(line).date.toISOString()
        } catch {
          throw new Error(`Line ${i + 1} is not a timestamp or date: ${line.trim().slice(0, 40)}`)
        }
      }),
    ),
  },
]

export const nodeTypeMap = new Map(nodeTypes.map((def) => [def.type, def]))

export function defaultParams(def: NodeTypeDef): Params {
  return Object.fromEntries(def.params.map((param) => [param.key, param.default]))
}
