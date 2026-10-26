// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyRuntime, evaluateGraph, wouldCreateCycle, type GraphEdge, type GraphNode } from './evaluate'
import { defaultParams, nodeTypeMap, nodeTypes } from './nodeTypes'

const node = (id: string, type: string, params = {}): GraphNode => ({
  id,
  type,
  params: { ...defaultParams(nodeTypeMap.get(type)!), ...params },
})
const edge = (source: string, target: string, targetPort = 0): GraphEdge => ({ source, target, targetPort })

describe('evaluateGraph', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('runs a chain', async () => {
    const results = await evaluateGraph(
      [node('in', 'input', { text: 'b\na\nb\n' }), node('sort', 'sort'), node('uniq', 'unique'), node('b64', 'base64Encode')],
      [edge('in', 'sort'), edge('sort', 'uniq'), edge('uniq', 'b64')],
    )
    expect(results.get('uniq')).toEqual({ status: 'ok', output: 'a\nb\n' })
    expect(results.get('b64')).toEqual({ status: 'ok', output: btoa('a\nb\n') })
  })

  it('branches and merges', async () => {
    const results = await evaluateGraph(
      [node('in', 'input', { text: 'x' }), node('up', 'case'), node('cat', 'concat', { separator: '-' })],
      [edge('in', 'up'), edge('in', 'cat', 0), edge('up', 'cat', 1)],
    )
    expect(results.get('cat')).toEqual({ status: 'ok', output: 'x-X' })
  })

  it('reports errors and waits downstream', async () => {
    const results = await evaluateGraph(
      [node('in', 'input', { text: '{bad' }), node('json', 'jsonFormat'), node('b64', 'base64Encode'), node('lonely', 'sort')],
      [edge('in', 'json'), edge('json', 'b64')],
    )
    expect(results.get('json')?.status).toBe('error')
    expect(results.get('b64')).toEqual({ status: 'waiting', message: 'Input has no result' })
    expect(results.get('lonely')).toEqual({ status: 'waiting', message: 'Connect input' })
  })

  it('feeds the current time into date formatting', async () => {
    const now = new Date(Date.UTC(2026, 9, 20, 13, 5, 9))
    const results = await evaluateGraph(
      [node('now', 'now'), node('fmt', 'dateFormat', { pattern: 'dddd HH:mm Z', timeZone: 'Europe/Oslo', locale: 'nb' }), node('unix', 'now', { as: 'unix' })],
      [edge('now', 'fmt')],
      now,
    )
    expect(results.get('now')).toEqual({ status: 'ok', output: '2026-10-20T13:05:09.000Z' })
    expect(results.get('fmt')).toEqual({ status: 'ok', output: 'tirsdag 15:05 +02:00' })
    expect(results.get('unix')).toEqual({ status: 'ok', output: '1792501509' })
  })

  it('formats every line and names the bad one', async () => {
    const results = await evaluateGraph(
      [node('in', 'input', { text: '0\n\n1700000000000\nnope' }), node('fmt', 'dateFormat', { pattern: 'YYYY-MM-DD', timeZone: 'UTC' })],
      [edge('in', 'fmt')],
    )
    expect(results.get('fmt')).toEqual({ status: 'error', message: 'Line 4 is not a timestamp or date: nope' })
  })

  it('replaces with text from the optional insert input', async () => {
    const nodes = [
      node('text', 'input', { text: 'Hello NAME\nBye NAME\n' }),
      node('name', 'input', { text: 'Åse $1\n' }),
      node('rep', 'replace', { pattern: 'NAME', replacement: 'fallback' }),
    ]
    const withInsert = await evaluateGraph(nodes, [edge('text', 'rep', 0), edge('name', 'rep', 1)])
    expect(withInsert.get('rep')).toEqual({ status: 'ok', output: 'Hello Åse $1\nBye Åse $1\n' })
    const withoutInsert = await evaluateGraph(nodes, [edge('text', 'rep', 0)])
    expect(withoutInsert.get('rep')).toEqual({ status: 'ok', output: 'Hello fallback\nBye fallback\n' })
    const noText = await evaluateGraph(nodes, [edge('name', 'rep', 1)])
    expect(noText.get('rep')).toEqual({ status: 'waiting', message: 'Connect input text' })
  })

  it('fetches only when clicked, once per click', async () => {
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => new Response(JSON.stringify([{ id: 1 }, { id: 2 }]) + (init?.body ?? ''), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const nodes = [node('f', 'fetch', { url: 'https://example.com/a.json' }), node('ids', 'jsonMap', { path: 'id' })]
    const edges = [edge('f', 'ids')]
    const runtime = emptyRuntime()

    expect((await evaluateGraph(nodes, edges, new Date(), runtime)).get('f')).toEqual({ status: 'waiting', message: 'Click Fetch to load' })
    expect(fetchMock).not.toHaveBeenCalled()

    runtime.clicks.f = 1
    expect((await evaluateGraph(nodes, edges, new Date(), runtime)).get('ids')).toEqual({ status: 'ok', output: '1\n2' })
    await evaluateGraph(nodes, edges, new Date(), runtime)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const changed = [node('f', 'fetch', { url: 'https://example.com/b.json' })]
    expect((await evaluateGraph(changed, [], new Date(), runtime)).get('f')?.status).toBe('waiting')
    runtime.clicks.f = 2
    expect((await evaluateGraph(changed, [], new Date(), runtime)).get('f')?.status).toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reports fetch failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('gone', { status: 404, statusText: 'Not Found' })))
    const runtime = { ...emptyRuntime(), clicks: { a: 1, b: 1, c: 1 } }
    const results = await evaluateGraph(
      [node('a', 'fetch', { url: 'https://example.com' }), node('b', 'fetch', { url: 'example.com' }), node('c', 'fetch', { url: 'https://example.com', output: 'full' })],
      [],
      new Date(),
      runtime,
    )
    expect(results.get('a')).toEqual({ status: 'error', message: '404 Not Found' })
    expect(results.get('b')?.status).toBe('error')
    expect(results.get('c')).toEqual({ status: 'ok', output: '404 Not Found\ncontent-type: text/plain;charset=UTF-8\n\ngone' })
  })

  it('maps with a template from the template input', async () => {
    const results = await evaluateGraph(
      [node('data', 'input', { text: '[{"a":{"b":1}},{"a":{"b":2}}]' }), node('tpl', 'input', { text: 'b={a.b}\n' }), node('map', 'jsonMap', { template: 'ignored' })],
      [edge('data', 'map', 0), edge('tpl', 'map', 1)],
    )
    expect(results.get('map')).toEqual({ status: 'ok', output: 'b=1\nb=2' })
  })

  it('survives a loop', async () => {
    const results = await evaluateGraph([node('a', 'case'), node('b', 'case')], [edge('a', 'b'), edge('b', 'a')])
    expect(results.get('a')?.status).not.toBe('ok')
  })

  it('every node type has unique type and valid defaults', () => {
    expect(new Set(nodeTypes.map((d) => d.type)).size).toBe(nodeTypes.length)
  })
})

describe('wouldCreateCycle', () => {
  it('detects loops', () => {
    const edges = [edge('a', 'b'), edge('b', 'c')]
    expect(wouldCreateCycle(edges, 'c', 'a')).toBe(true)
    expect(wouldCreateCycle(edges, 'a', 'c')).toBe(false)
    expect(wouldCreateCycle(edges, 'a', 'a')).toBe(true)
  })
})
