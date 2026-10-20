import { decodeBase64, encodeBase64 } from '../tools/base64'
import type { GraphEdge } from './evaluate'
import { defaultParams, nodeTypeMap, type Params } from './nodeTypes'

export interface SharedNode {
  id: string
  type: string
  params: Params
  position: { x: number; y: number }
}

export interface SharedPipeline {
  nodes: SharedNode[]
  edges: GraphEdge[]
}

const version = 1

/**
 * Encodes a pipeline as URL-safe Base64. Compact on purpose so links stay short:
 * nodes are tuples, positions are rounded and only params that differ from the default are kept.
 */
export function encodePipeline({ nodes, edges }: SharedPipeline): string {
  const compact = {
    v: version,
    n: nodes.map((node) => {
      const defaults = defaultParams(nodeTypeMap.get(node.type)!)
      const changed = Object.fromEntries(Object.entries(node.params).filter(([key, value]) => defaults[key] !== value))
      return [node.id, node.type, Math.round(node.position.x), Math.round(node.position.y), changed]
    }),
    e: edges.map((edge) => [edge.source, edge.target, edge.targetPort]),
  }
  return encodeBase64(JSON.stringify(compact), true)
}

/** Accepts the Base64 string itself or a whole link containing `pipeline=<base64>`. */
export function decodePipeline(input: string): SharedPipeline {
  const encoded = input.trim().match(/pipeline=([A-Za-z0-9_\-+/=]+)/)?.[1] ?? input.trim()
  let compact: { v?: unknown; n?: unknown; e?: unknown }
  try {
    compact = JSON.parse(decodeBase64(encoded))
  } catch {
    throw new Error('This is not a shared pipeline')
  }
  if (compact.v !== version || !Array.isArray(compact.n) || !Array.isArray(compact.e)) {
    throw new Error('This is not a shared pipeline, or it was made by a newer version')
  }

  const nodes: SharedNode[] = []
  for (const entry of compact.n) {
    const [id, type, x, y, params] = entry as [unknown, unknown, unknown, unknown, unknown]
    const def = typeof type === 'string' ? nodeTypeMap.get(type) : undefined
    if (typeof id !== 'string' || !def) throw new Error(`Unknown node in the shared pipeline: ${String(type)}`)
    const defaults = defaultParams(def)
    // Only take params the node actually has, with the right type.
    const given = typeof params === 'object' && params !== null ? (params as Params) : {}
    const merged = Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [key, typeof given[key] === typeof value ? given[key] : value]),
    )
    nodes.push({ id, type: def.type, params: merged, position: { x: Number(x) || 0, y: Number(y) || 0 } })
  }

  const ids = new Set(nodes.map((node) => node.id))
  const edges = (compact.e as unknown[][])
    .map(([source, target, port]) => ({ source: String(source), target: String(target), targetPort: Number(port) || 0 }))
    .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
  return { nodes, edges }
}
