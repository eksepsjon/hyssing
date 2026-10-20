import { decodeBase64, encodeBase64 } from '../tools/base64'
import { formatJson, minifyJson } from '../tools/json'
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
  | { key: string; label: string; kind: 'text' | 'textarea'; default: string; placeholder?: string }
  | { key: string; label: string; kind: 'checkbox'; default: boolean }
  | { key: string; label: string; kind: 'select'; default: string; options: { value: string; label: string }[] }

export type Params = Record<string, ParamValue>

export interface NodeTypeDef {
  type: string
  label: string
  category: string
  /** Names of the input ports, in order. Source nodes have none. */
  inputs: string[]
  params: ParamDef[]
  run: (inputs: string[], params: Params) => string | Promise<string>
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
    inputs: ['in'],
    params: [
      { key: 'pattern', label: 'Regex', kind: 'text', default: '', placeholder: '(\\w+)@(\\w+)' },
      { key: 'replacement', label: 'Replace with', kind: 'text', default: '', placeholder: '$2 ($1)' },
      ignoreCase,
    ],
    run: perLine((lines, p) => replaceInLines(lines, p.pattern as string, p.replacement as string, { ignoreCase: p.ignoreCase as boolean })),
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
