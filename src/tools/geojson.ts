import type { GeoJsonObject } from 'geojson'

const geometryTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection']
const types = [...geometryTypes, 'Feature', 'FeatureCollection']

export function parseGeoJson(input: string): GeoJsonObject {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`)
  }
  const type = (value as { type?: unknown } | null)?.type
  if (typeof type !== 'string' || !types.includes(type)) {
    throw new Error(`Not GeoJSON: expected "type" to be one of ${types.join(', ')}`)
  }
  return value as GeoJsonObject
}

export function countFeatures(geojson: GeoJsonObject): number {
  if (geojson.type === 'FeatureCollection') return (geojson as GeoJSON.FeatureCollection).features.length
  return 1
}
