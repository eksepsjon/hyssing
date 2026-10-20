import { decodeBase64, encodeBase64 } from './base64'
import { formatJson, minifyJson } from './json'
import { formatMarkdown } from './markdown'
import { formatXml, minifyXml } from './xml'

export interface ToolOptions {
  indent: string
  urlSafe: boolean
}

export interface Action {
  label: string
  run: (input: string, options: ToolOptions) => string | Promise<string>
}

export interface TextToolDefinition {
  id: string
  name: string
  description: string
  placeholder: string
  options: (keyof ToolOptions)[]
  actions: Action[]
}

export const textTools: TextToolDefinition[] = [
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode text to Base64, or decode Base64 back to text (UTF-8).',
    placeholder: 'Text to encode, or Base64 to decode…',
    options: ['urlSafe'],
    actions: [
      { label: 'Encode', run: (input, { urlSafe }) => encodeBase64(input, urlSafe) },
      { label: 'Decode', run: (input) => decodeBase64(input) },
    ],
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Validate and pretty-print or minify JSON.',
    placeholder: '{"paste": ["your", "json"]}',
    options: ['indent'],
    actions: [
      { label: 'Format', run: (input, { indent }) => formatJson(input, indent) },
      { label: 'Minify', run: (input) => minifyJson(input) },
    ],
  },
  {
    id: 'xml',
    name: 'XML',
    description: 'Validate and pretty-print or minify XML.',
    placeholder: '<paste><your>xml</your></paste>',
    options: ['indent'],
    actions: [
      { label: 'Format', run: (input, { indent }) => formatXml(input, indent) },
      { label: 'Minify', run: (input) => minifyXml(input) },
    ],
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Tidy up Markdown with consistent headings, lists, tables and spacing.',
    placeholder: '#  Paste\n* your\n* markdown',
    options: [],
    actions: [{ label: 'Format', run: (input) => formatMarkdown(input) }],
  },
]
