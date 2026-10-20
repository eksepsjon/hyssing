import { lazy } from 'react'

// Leaflet and the bundled world map are only downloaded when the map tool is opened.
const LazyMapTool = lazy(() => import('./MapTool'))

export default LazyMapTool
