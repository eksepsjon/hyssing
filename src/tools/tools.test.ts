// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './base64'
import { formatJson, minifyJson } from './json'
import { formatMarkdown } from './markdown'
import { formatXml, minifyXml } from './xml'

describe('base64', () => {
  it('round-trips unicode text', () => {
    const text = 'Hei på deg 👋'
    expect(decodeBase64(encodeBase64(text))).toBe(text)
  })
  it('encodes and decodes URL-safe without padding', () => {
    expect(encodeBase64('??>', true)).toBe('Pz8-')
    expect(decodeBase64('Pz8-')).toBe('??>')
    expect(decodeBase64('aGk')).toBe('hi')
  })
  it('rejects invalid input', () => {
    expect(() => decodeBase64('a')).toThrow()
    expect(() => decodeBase64('!!!!')).toThrow()
  })
})

describe('json', () => {
  it('formats and minifies', () => {
    expect(formatJson('{"a":[1,2]}')).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}')
    expect(minifyJson('{ "a" : 1 }')).toBe('{"a":1}')
  })
  it('reports invalid JSON', () => {
    expect(() => formatJson('{a:1}')).toThrow(/Invalid JSON/)
  })
})

describe('xml', () => {
  const input = '<?xml version="1.0"?><root a="1"><!-- hi --><item>x &amp; y</item><empty></empty><b><c/></b></root>'
  it('formats', () => {
    expect(formatXml(input)).toBe(
      [
        '<?xml version="1.0"?>',
        '<root a="1">',
        '  <!-- hi -->',
        '  <item>x &amp; y</item>',
        '  <empty/>',
        '  <b>',
        '    <c/>',
        '  </b>',
        '</root>',
      ].join('\n'),
    )
  })
  it('minifies', () => {
    expect(minifyXml(formatXml(input))).toBe(
      '<?xml version="1.0"?><root a="1"><!-- hi --><item>x &amp; y</item><empty/><b><c/></b></root>',
    )
  })
  it('reports invalid XML', () => {
    expect(() => formatXml('<a><b></a>')).toThrow(/Invalid XML/)
  })
})

describe('markdown', () => {
  it('formats', async () => {
    expect(await formatMarkdown('#  Title\n* one\n* two')).toBe('# Title\n\n- one\n- two\n')
  })
})
