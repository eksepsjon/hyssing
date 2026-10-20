import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import countries from 'world-atlas/countries-110m.json'
import { countFeatures, parseGeoJson } from '../tools/geojson'

const sample = JSON.stringify(
  {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: 'Oslo' }, geometry: { type: 'Point', coordinates: [10.7522, 59.9139] } },
      { type: 'Feature', properties: { name: 'Bergen' }, geometry: { type: 'Point', coordinates: [5.3221, 60.3913] } },
      {
        type: 'Feature',
        properties: { name: 'Bergensbanen (roughly)' },
        geometry: { type: 'LineString', coordinates: [[10.7522, 59.9139], [8.0, 60.6], [5.3221, 60.3913]] },
      },
      {
        type: 'Feature',
        properties: { name: 'Hardangervidda (roughly)' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[6.9, 60.0], [8.3, 60.0], [8.3, 60.6], [6.9, 60.6], [6.9, 60.0]]],
        },
      },
    ],
  },
  null,
  2,
)

// Natural Earth 1:110m country outlines, bundled so the map works without any network access.
const world = feature(
  countries as unknown as Topology,
  (countries as unknown as Topology).objects.countries as GeometryCollection,
)

function propertiesPopup(properties: Record<string, unknown> | null): HTMLElement | undefined {
  const entries = Object.entries(properties ?? {})
  if (entries.length === 0) return undefined
  // Built with DOM nodes rather than an HTML string so property values can't inject markup.
  const table = document.createElement('table')
  for (const [key, value] of entries) {
    const row = table.insertRow()
    row.insertCell().textContent = key
    row.insertCell().textContent = typeof value === 'object' ? JSON.stringify(value) : String(value)
  }
  return table
}

export default function MapTool() {
  const [input, setInput] = useState('')
  const [showTiles, setShowTiles] = useState(false)
  const deferredInput = useDeferredValue(input)
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map>(null)
  const dataLayer = useRef<L.GeoJSON>(null)

  const parsed = useMemo(() => {
    if (!deferredInput.trim()) return undefined
    try {
      return { value: parseGeoJson(deferredInput) }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }, [deferredInput])

  useEffect(() => {
    const instance = L.map(container.current!, { worldCopyJump: true, attributionControl: true }).setView([30, 10], 2)
    instance.attributionControl.setPrefix(false).addAttribution('Outlines: Natural Earth')
    L.geoJSON(world, { style: { className: 'world-country' }, interactive: false }).addTo(instance)
    map.current = instance
    // The pane can change size with the layout; keep Leaflet's idea of it in sync.
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(container.current!)
    return () => {
      observer.disconnect()
      instance.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!showTiles) return
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current!)
    return () => {
      tiles.remove()
    }
  }, [showTiles])

  useEffect(() => {
    dataLayer.current?.remove()
    dataLayer.current = null
    if (!parsed?.value) return
    const layer = L.geoJSON(parsed.value, {
      // Leaflet applies `style` to point markers too, so the geometry class has to be chosen here.
      style: (feature) => {
        const type = feature?.geometry.type ?? ''
        const kind = type.endsWith('Point') ? 'geo-point' : type.endsWith('LineString') ? 'geo-line' : ''
        return { className: `geo-feature ${kind}` }
      },
      pointToLayer: (_, latlng) => L.circleMarker(latlng, { radius: 6 }),
      onEachFeature: (feature, featureLayer) => {
        const popup = propertiesPopup(feature.properties)
        if (popup) featureLayer.bindPopup(popup)
      },
    }).addTo(map.current!)
    dataLayer.current = layer
    const bounds = layer.getBounds()
    if (bounds.isValid()) map.current!.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 })
  }, [parsed])

  async function openFile(file: File | undefined) {
    if (file) setInput(await file.text())
  }

  return (
    <>
      <div className="toolbar">
        <label className="file">
          <input type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={(e) => openFile(e.target.files?.[0])} />
          <span className="button">Open file…</span>
        </label>
        <button onClick={() => setInput(sample)}>Load example</button>
        <label title="Map tiles are downloaded from openstreetmap.org. Your GeoJSON never leaves the browser.">
          <input type="checkbox" checked={showTiles} onChange={(e) => setShowTiles(e.target.checked)} />
          OpenStreetMap background (online)
        </label>
      </div>

      <div className="panes">
        <section>
          <div className="pane-header">
            <h2>GeoJSON</h2>
            {parsed?.value && <span className="muted small">{countFeatures(parsed.value)} feature(s)</span>}
            <button className="link" onClick={() => setInput('')} disabled={!input}>
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"type": "Point", "coordinates": [10.75, 59.91]}'
            spellCheck={false}
            aria-label="GeoJSON"
          />
          {parsed?.error && (
            <div className="error compact" role="alert">
              {parsed.error}
            </div>
          )}
        </section>
        <section>
          <div className="pane-header">
            <h2>Map</h2>
          </div>
          <div ref={container} className="map" />
        </section>
      </div>
    </>
  )
}
