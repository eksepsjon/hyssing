import type { ReactNode } from 'react'
import JwtTool from './components/JwtTool'
import MapTool from './components/LazyMapTool'
import LinesTool from './components/LinesTool'
import TextTool from './components/TextTool'
import TimeTool from './components/TimeTool'
import { textTools } from './tools/text'

export interface Tool {
  id: string
  name: string
  description: string
  render: () => ReactNode
}

export const tools: Tool[] = [
  ...textTools.map((tool) => ({ ...tool, render: () => <TextTool tool={tool} /> })),
  {
    id: 'lines',
    name: 'Lines',
    description: 'Sort, deduplicate, shuffle, filter and find-and-replace line by line. Chain steps with "Use as input".',
    render: () => <LinesTool />,
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
