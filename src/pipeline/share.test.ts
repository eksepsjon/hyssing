import { describe, expect, it } from 'vitest'
import { encodeBase64 } from '../tools/base64'
import { decodePipeline, encodePipeline, type SharedPipeline } from './share'
import { defaultParams, nodeTypeMap } from './nodeTypes'

const pipeline: SharedPipeline = {
  nodes: [
    { id: 'n1', type: 'input', params: { text: 'Åse\nbanana 🍌' }, position: { x: 0.4, y: 10 } },
    { id: 'n2', type: 'sort', params: { ...defaultParams(nodeTypeMap.get('sort')!), order: 'desc' }, position: { x: 280, y: 0 } },
    { id: 'n3', type: 'concat', params: { separator: ', ' }, position: { x: 560, y: 0 } },
  ],
  edges: [
    { source: 'n1', target: 'n2', targetPort: 0 },
    { source: 'n1', target: 'n3', targetPort: 0 },
    { source: 'n2', target: 'n3', targetPort: 1 },
  ],
}

describe('share', () => {
  it('round-trips, filling in defaults', () => {
    const decoded = decodePipeline(encodePipeline(pipeline))
    expect(decoded.edges).toEqual(pipeline.edges)
    expect(decoded.nodes[0]).toEqual({ ...pipeline.nodes[0], position: { x: 0, y: 10 } })
    expect(decoded.nodes[1].params).toEqual(pipeline.nodes[1].params)
  })

  it('produces URL-safe output and accepts whole links', () => {
    const encoded = encodePipeline(pipeline)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodePipeline(`https://example.com/hyssing/#pipeline=${encoded}`).nodes).toHaveLength(3)
  })

  it('rejects garbage and unknown nodes', () => {
    expect(() => decodePipeline('not base64!')).toThrow(/not a shared pipeline/)
    expect(() => decodePipeline(encodeBase64('{"v":1,"n":[["a","rm -rf",0,0,{}]],"e":[]}', true))).toThrow(/Unknown node/)
  })

  it('ignores params with the wrong type or unknown keys', () => {
    const tampered = encodeBase64('{"v":1,"n":[["a","sort",0,0,{"natural":"yes","evil":1}]],"e":[["a","missing",0]]}', true)
    const decoded = decodePipeline(tampered)
    expect(decoded.nodes[0].params).toEqual(defaultParams(nodeTypeMap.get('sort')!))
    expect(decoded.edges).toEqual([])
  })
})
