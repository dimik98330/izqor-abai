// Geographic overview only: latitude/longitude projected around the region's centre.
// The extruded thickness is a visual treatment, not measured terrain elevation.
export type Coordinate = [number, number];
export interface Boundary {
  features: { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] } }[];
}
export const REGION_CENTRE: Coordinate = [80.09, 48.62];
export function projectCoordinate([longitude, latitude]: Coordinate): Coordinate {
  return [(longitude - REGION_CENTRE[0]) * Math.cos(REGION_CENTRE[1] * Math.PI / 180) * 1.8,
    (latitude - REGION_CENTRE[1]) * 1.8];
}
export function boundaryPolygons(boundary: Boundary): Coordinate[][][] {
  return boundary.features.flatMap(({ geometry }) => {
    if (geometry.type === 'Polygon') return [geometry.coordinates as Coordinate[][]];
    if (geometry.type === 'MultiPolygon') return geometry.coordinates as Coordinate[][][];
    throw new Error('Unsupported region geometry');
  });
}
