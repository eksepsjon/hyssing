import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  getNodesBounds,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type IsValidConnection,
  type XYPosition,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { emptyRuntime, evaluateGraph, wouldCreateCycle, type GraphEdge, type NodeResult } from '../pipeline/evaluate'
import { defaultParams, nodeTypeMap, nodeTypes, type ParamValue } from '../pipeline/nodeTypes'
import { decodePipeline, encodePipeline, type SharedPipeline } from '../pipeline/share'
import CopyButton from './CopyButton'
import { PipelineContext, type PipelineFlowNode } from '../pipeline/context'
import PipelineNode from './PipelineNode'

const flowNodeTypes = { pipeline: PipelineNode }
const storageKey = 'hyssing.pipeline'
const columnWidth = 280

function makeNode(id: string, type: string, position: XYPosition, params = {}): PipelineFlowNode {
  return { id, type: 'pipeline', position, data: { type, params: { ...defaultParams(nodeTypeMap.get(type)!), ...params } } }
}

function makeEdge(source: string, target: string, port = 0): Edge {
  return { id: `${source}->${target}:${port}`, source, target, sourceHandle: 'out', targetHandle: `in-${port}` }
}

function exampleGraph(): { nodes: PipelineFlowNode[]; edges: Edge[] } {
  const text = 'banana\nÅse\napple\n\nzebra\nbanana\nØystein\nitem10\nitem2\n'
  return {
    nodes: [
      makeNode('n1', 'input', { x: 0, y: 40 }, { text }),
      makeNode('n2', 'removeEmpty', { x: columnWidth, y: 0 }),
      makeNode('n3', 'sort', { x: columnWidth * 2, y: 0 }),
      makeNode('n4', 'unique', { x: columnWidth * 3, y: 0 }),
      makeNode('n5', 'base64Encode', { x: columnWidth * 4, y: 0 }),
      makeNode('n6', 'case', { x: columnWidth * 4, y: 260 }),
    ],
    edges: [makeEdge('n1', 'n2'), makeEdge('n2', 'n3'), makeEdge('n3', 'n4'), makeEdge('n4', 'n5'), makeEdge('n4', 'n6')],
  }
}

function fromShared({ nodes, edges }: SharedPipeline): { nodes: PipelineFlowNode[]; edges: Edge[] } {
  return {
    nodes: nodes.map((node) => makeNode(node.id, node.type, node.position, node.params)),
    edges: edges.map((edge) => makeEdge(edge.source, edge.target, edge.targetPort)),
  }
}

/** A pipeline shared through the link (#pipeline=…), if the page was opened with one. */
function sharedFromHash(): { nodes: PipelineFlowNode[]; edges: Edge[] } | undefined {
  if (!window.location.hash.startsWith('#pipeline=')) return undefined
  try {
    return fromShared(decodePipeline(window.location.hash))
  } catch {
    return undefined
  } finally {
    // Drop the data from the address bar; from here on the pipeline is saved like any other edit.
    history.replaceState(null, '', '#pipeline')
  }
}

function loadGraph(): { nodes: PipelineFlowNode[]; edges: Edge[] } {
  const shared = sharedFromHash()
  if (shared) return shared
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (Array.isArray(saved?.nodes) && Array.isArray(saved?.edges)) {
      const nodes = (saved.nodes as PipelineFlowNode[])
        .filter((node) => nodeTypeMap.has(node.data?.type))
        .map((node) => makeNode(node.id, node.data.type, node.position, node.data.params))
      const ids = new Set(nodes.map((node) => node.id))
      const edges = (saved.edges as Edge[])
        .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
        .map((edge) => makeEdge(edge.source, edge.target, portOf(edge.targetHandle)))
      return { nodes, edges }
    }
  } catch {
    // Unreadable or unavailable storage: start from the example.
  }
  return exampleGraph()
}

function portOf(handle: string | null | undefined): number {
  return Number(handle?.replace('in-', '') ?? 0) || 0
}

function toGraphEdges(edges: Edge[]): GraphEdge[] {
  return edges.map((edge) => ({ source: edge.source, target: edge.target, targetPort: portOf(edge.targetHandle) }))
}

/** Node ids are n1, n2, …; continue after the highest so imported graphs with gaps don't collide. */
function firstFreeId(nodes: PipelineFlowNode[]): number {
  return Math.max(0, ...nodes.map((node) => Number(node.id.slice(1)) || 0)) + 1
}

const categories = [...new Set(nodeTypes.map((def) => def.category))]

function Editor() {
  const [initial] = useState(loadGraph)
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineFlowNode>(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges)
  const [results, setResults] = useState<Map<string, NodeResult>>(new Map())
  const [viewedId, setViewedId] = useState<string | undefined>(initial.nodes.at(-1)?.id)
  const nextId = useRef(firstFreeId(initial.nodes))
  const canvas = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, setViewport } = useReactFlow()
  const nodesInitialized = useNodesInitialized()
  const needsFraming = useRef(true)
  // Button clicks and fetched responses live only in this session: never saved or shared.
  const runtime = useRef(emptyRuntime())
  const [clicks, setClicks] = useState<Record<string, number>>({})

  // Frame the graph like fitView, but never below a readable zoom; when it is still too wide,
  // start from its left edge (where pipelines begin) instead of the middle.
  const frameGraph = useCallback(() => {
    if (!canvas.current || nodes.length === 0) return
    const bounds = getNodesBounds(nodes)
    const { width, height } = canvas.current.getBoundingClientRect()
    const margin = 32
    const zoom = Math.min(1, Math.max(0.75, Math.min((width - 2 * margin) / bounds.width, (height - 2 * margin) / bounds.height)))
    const place = (size: number, start: number, extent: number) =>
      extent * zoom <= size - 2 * margin ? (size - extent * zoom) / 2 - start * zoom : margin - start * zoom
    setViewport({ x: place(width, bounds.x, bounds.width), y: place(height, bounds.y, bounds.height), zoom })
  }, [nodes, setViewport])

  useEffect(() => {
    if (nodesInitialized && needsFraming.current) {
      needsFraming.current = false
      frameGraph()
    }
  }, [nodesInitialized, frameGraph])

  // Only what affects results; dragging nodes around doesn't re-run anything.
  const graphKey = JSON.stringify([nodes.map((n) => [n.id, n.data]), toGraphEdges(edges)])

  // Clock nodes need a fresh result every second; other pipelines only re-run when edited.
  const hasLiveNode = nodes.some((node) => nodeTypeMap.get(node.data.type)?.live)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!hasLiveNode) return
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [hasLiveNode])

  useEffect(() => {
    let cancelled = false
    const [graphNodes, graphEdges] = JSON.parse(graphKey) as [[string, PipelineFlowNode['data']][], GraphEdge[]]
    runtime.current.clicks = clicks
    evaluateGraph(
      graphNodes.map(([id, data]) => ({ id, ...data })),
      graphEdges,
      new Date(),
      runtime.current,
    ).then((next) => !cancelled && setResults(next))
    return () => {
      cancelled = true
    }
  }, [graphKey, tick, clicks])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ nodes: nodes.map(({ id, position, data }) => ({ id, position, data })), edges }))
      } catch {
        // Not saving is fine; the pipeline just won't survive a reload.
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [nodes, edges])

  const setParam = useCallback(
    (id: string, key: string, value: ParamValue) =>
      setNodes((all) => all.map((node) => (node.id === id ? { ...node, data: { ...node.data, params: { ...node.data.params, [key]: value } } } : node))),
    [setNodes],
  )

  const remove = useCallback(
    (id: string) => {
      runtime.current.done.delete(id)
      setNodes((all) => all.filter((node) => node.id !== id))
      setEdges((all) => all.filter((edge) => edge.source !== id && edge.target !== id))
    },
    [setNodes, setEdges],
  )

  const act = useCallback((id: string) => {
    setClicks((all) => ({ ...all, [id]: (all[id] ?? 0) + 1 }))
    setResults((all) => new Map(all).set(id, { status: 'waiting', message: 'Working…' }))
  }, [])

  const actions = useMemo(() => ({ results, setParam, remove, act }), [results, setParam, remove, act])

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => !wouldCreateCycle(toGraphEdges(edges), connection.source, connection.target),
    [edges],
  )

  const onConnect = useCallback(
    (connection: Connection) =>
      // An input port takes one connection; a new one replaces the old.
      setEdges((all) =>
        addEdge(
          makeEdge(connection.source, connection.target, portOf(connection.targetHandle)),
          all.filter((edge) => !(edge.target === connection.target && edge.targetHandle === connection.targetHandle)),
        ),
      ),
    [setEdges],
  )

  function addNode(type: string) {
    const id = `n${nextId.current++}`
    const def = nodeTypeMap.get(type)!
    const selected = nodes.find((node) => node.selected)
    const rect = canvas.current!.getBoundingClientRect()
    // Chain after the selected node when there is one, otherwise drop it in the middle of the view.
    const position = selected
      ? { x: selected.position.x + columnWidth, y: selected.position.y }
      : screenToFlowPosition({ x: rect.left + rect.width / 2 - 120, y: rect.top + rect.height / 3 })
    setNodes((all) => [...all.map((node) => ({ ...node, selected: false })), { ...makeNode(id, type, position), selected: true }])
    if (selected && def.inputs.length > 0) setEdges((all) => [...all, makeEdge(selected.id, id)])
    setViewedId(id)
  }

  function reset(graph: { nodes: PipelineFlowNode[]; edges: Edge[] }) {
    runtime.current = emptyRuntime()
    setClicks({})
    setNodes(graph.nodes)
    setEdges(graph.edges)
    setViewedId(graph.nodes.at(-1)?.id)
    nextId.current = firstFreeId(graph.nodes)
    needsFraming.current = true
  }

  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const shareCode = encodePipeline({
    nodes: nodes.map((node) => ({ id: node.id, type: node.data.type, params: node.data.params, position: node.position })),
    edges: toGraphEdges(edges),
  })
  const shareLink = `${window.location.origin}${window.location.pathname}#pipeline=${shareCode}`

  function importPipeline() {
    try {
      reset(fromShared(decodePipeline(importText)))
      setImportText('')
      setImportError('')
    } catch (e) {
      setImportError((e as Error).message)
    }
  }

  // Opening a shared link while already on this tab only changes the hash, so load it here.
  useEffect(() => {
    const onHashChange = () => {
      const shared = sharedFromHash()
      if (shared) reset(shared)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  const viewed = nodes.find((node) => node.id === viewedId)
  const viewedResult = viewed && results.get(viewed.id)

  return (
    <PipelineContext.Provider value={actions}>
      <div className="pipeline">
        <aside className="palette" aria-label="Nodes">
          <p className="muted small">Click to add. With a node selected, the new node is chained after it.</p>
          {categories.map((category) => (
            <div key={category}>
              <h3>{category}</h3>
              {nodeTypes
                .filter((def) => def.category === category)
                .map((def) => (
                  <button key={def.type} onClick={() => addNode(def.type)}>
                    {def.label}
                  </button>
                ))}
            </div>
          ))}
          <div className="share">
            <h3>Share</h3>
            <p className="muted small">The whole pipeline, including input text, as Base64.</p>
            <CopyButton text={shareLink} label="Copy link" />
            <CopyButton text={shareCode} label="Copy Base64" />
            <input
              type="text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && importText && importPipeline()}
              placeholder="Paste link or Base64"
              spellCheck={false}
              aria-label="Shared pipeline to import"
            />
            <button onClick={importPipeline} disabled={!importText}>
              Import
            </button>
            {importError && (
              <p className="error compact" role="alert">
                {importError}
              </p>
            )}
          </div>
          <div className="palette-actions">
            <button className="link" onClick={() => reset(exampleGraph())}>
              Load example
            </button>
            <button className="link" onClick={() => reset({ nodes: [makeNode('n1', 'input', { x: 0, y: 0 })], edges: [] })}>
              Clear
            </button>
          </div>
        </aside>

        <div className="canvas" ref={canvas}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={flowNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={(_, node) => setViewedId(node.id)}
            colorMode="system"
            minZoom={0.2}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ animated: false }}
          >
            <Background gap={24} />
            <Controls showInteractive={false} fitViewOptions={{ padding: 0.1 }} />
          </ReactFlow>
        </div>

        <section className="viewer">
          <div className="pane-header">
            <h2>Viewer{viewed ? `: ${nodeTypeMap.get(viewed.data.type)?.label}` : ''}</h2>
            {viewedResult?.status === 'ok' && <CopyButton text={viewedResult.output} />}
          </div>
          {!viewed && <p className="muted small">Click a node to view its full output.</p>}
          {viewedResult && viewedResult.status !== 'ok' && (
            <div className={viewedResult.status === 'error' ? 'error' : 'error waiting'} role="status">
              {viewedResult.message}
            </div>
          )}
          {viewedResult?.status === 'ok' && <textarea value={viewedResult.output} readOnly spellCheck={false} aria-label="Viewer output" />}
        </section>
      </div>
    </PipelineContext.Provider>
  )
}

export default function PipelineTool() {
  return (
    <ReactFlowProvider>
      <Editor />
    </ReactFlowProvider>
  )
}
