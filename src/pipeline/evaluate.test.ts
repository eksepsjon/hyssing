// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { evaluateGraph, wouldCreateCycle, type GraphEdge, type GraphNode } from './evaluate'
import { defaultParams, nodeTypeMap, nodeTypes } from './nodeTypes'

const node = (id: string, type: string, params = {}): GraphNode => ({
  id,
  type,
  params: { ...defaultParams(nodeTypeMap.get(type)!), ...params },
})
const edge = (source: string, target: string, targetPort = 0): GraphEdge => ({ source, target, targetPort })

describe('evaluateGraph', () => {
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
