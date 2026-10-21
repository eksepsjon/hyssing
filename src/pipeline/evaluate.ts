import { nodeTypeMap, type Params } from './nodeTypes'

export interface GraphNode {
  id: string
  type: string
  params: Params
}

export interface GraphEdge {
  source: string
  target: string
  /** Index of the target's input port. */
  targetPort: number
}

export type NodeResult =
  | { status: 'ok'; output: string }
  | { status: 'error'; message: string }
  /** Not run: an input is unconnected or failed upstream. */
  | { status: 'waiting'; message: string }

/** Evaluates every node, each at most once, feeding outputs along edges. */
export async function evaluateGraph(nodes: GraphNode[], edges: GraphEdge[], now = new Date()): Promise<Map<string, NodeResult>> {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const results = new Map<string, Promise<NodeResult>>()

  function evaluate(id: string, visiting: Set<string>): Promise<NodeResult> {
    const cached = results.get(id)
    if (cached) return cached
    if (visiting.has(id)) return Promise.resolve({ status: 'error', message: 'This node is part of a loop' })
    const result = run(id, new Set(visiting).add(id))
    results.set(id, result)
    return result
  }

  async function run(id: string, visiting: Set<string>): Promise<NodeResult> {
    const node = byId.get(id)!
    const def = nodeTypeMap.get(node.type)
    if (!def) return { status: 'error', message: `Unknown node type: ${node.type}` }

    const inputs: string[] = []
    const connected: boolean[] = []
    for (let port = 0; port < def.inputs.length; port++) {
      const edge = edges.find((e) => e.target === id && e.targetPort === port && byId.has(e.source))
      const portName = def.inputs.length > 1 ? ` ${def.inputs[port]}` : ''
      connected.push(!!edge)
      if (!edge && def.optionalInputs?.includes(port)) {
        inputs.push('')
        continue
      }
      if (!edge) return { status: 'waiting', message: `Connect input${portName}` }
      const upstream = await evaluate(edge.source, visiting)
      if (upstream.status !== 'ok') return { status: 'waiting', message: `Input${portName} has no result` }
      inputs.push(upstream.output)
    }

    try {
      return { status: 'ok', output: await def.run(inputs, node.params, { now, connected }) }
    } catch (error) {
      return { status: 'error', message: (error as Error).message }
    }
  }

  const entries = await Promise.all(nodes.map(async (node) => [node.id, await evaluate(node.id, new Set())] as const))
  return new Map(entries)
}

/** True if adding source → target would create a loop. */
export function wouldCreateCycle(edges: GraphEdge[], source: string, target: string): boolean {
  if (source === target) return true
  const stack = [target]
  const seen = new Set<string>()
  while (stack.length) {
    const id = stack.pop()!
    if (id === source) return true
    if (seen.has(id)) continue
    seen.add(id)
    for (const edge of edges) if (edge.source === id) stack.push(edge.target)
  }
  return false
}
