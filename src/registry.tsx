import type { ReactNode } from 'react'
import DiffTool from './components/DiffTool'
import JwtTool from './components/JwtTool'
import MapTool from './components/LazyMapTool'
import PipelineTool from './components/LazyPipelineTool'
import TimeTool from './components/TimeTool'

export interface Tool {
  id: string
  name: string
  description: string
  /** Use the full window width instead of the centred column. */
  wide?: boolean
  render: () => ReactNode
}

export const tools: Tool[] = [
  {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Edit text by chaining nodes: Base64, JSON, XML, Markdown, line operations and more. Each node transforms its input and feeds the next. Drag from a node’s right edge to another’s left edge to connect.',
    wide: true,
    render: () => <PipelineTool />,
  },
  {
    id: 'diff',
    name: 'Diff',
    description: 'Compare two texts line by line, or two JSON documents value by value. Updates as you type.',
    render: () => <DiffTool />,
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
