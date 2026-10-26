import type { Node } from '@xyflow/react'
import { createContext } from 'react'
import type { NodeResult } from './evaluate'
import type { Params, ParamValue } from './nodeTypes'

export type PipelineNodeData = { type: string; params: Params }
export type PipelineFlowNode = Node<PipelineNodeData, 'pipeline'>

export interface PipelineActions {
  results: Map<string, NodeResult>
  setParam: (id: string, key: string, value: ParamValue) => void
  remove: (id: string) => void
  /** Clicks the node's action button. */
  act: (id: string) => void
}

export const PipelineContext = createContext<PipelineActions>({ results: new Map(), setParam: () => {}, remove: () => {}, act: () => {} })
