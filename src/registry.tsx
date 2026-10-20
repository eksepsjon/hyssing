import type { ReactNode } from 'react'
import JwtTool from './components/JwtTool'
import MapTool from './components/LazyMapTool'
import PipelineTool from './components/LazyPipelineTool'
import LinesTool from './components/LinesTool'
import TextTool from './components/TextTool'
import TimeTool from './components/TimeTool'
import { textTools } from './tools/text'

export interface Tool {
  id: string
  name: string
  description: string
  /** Use the full window width instead of the centred column. */
  wide?: boolean
  render: () => ReactNode
}

export const tools: Tool[] = [
  ...textTools.map((tool) => ({ ...tool, render: () => <TextTool tool={tool} /> })),
  {
    id: 'text',
    name: 'Text',
    description: 'Sort, deduplicate, shuffle, filter and find-and-replace line by line. Chain steps with "Use as input".',
    render: () => <LinesTool />,
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Chain tools as nodes: each node transforms its input and feeds the next. Drag from a node’s right edge to another’s left edge to connect.',
    wide: true,
    render: () => <PipelineTool />,
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'Decode JSON Web Tokens, verify their signature, or create and sign new ones.',
    render: () => <JwtTool />,
  },
  {
    id: 'map',
    name: 'GeoJSON',
    description: 'Render GeoJSON on a map. Click a feature to see its properties.',
    render: () => <MapTool />,
  },
  {
    id: 'time',
    name: 'Time',
    description: 'The current time in common formats, and a converter for Unix timestamps and dates.',
    render: () => <TimeTool />,
  },
]
