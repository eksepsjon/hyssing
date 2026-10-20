import { lazy } from 'react'

// The node editor library is only downloaded when the pipeline tool is opened.
const LazyPipelineTool = lazy(() => import('./PipelineTool'))

export default LazyPipelineTool
