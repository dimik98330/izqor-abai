import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { places } from './content';
import { boundaryPolygons, projectCoordinate, type Boundary, type Coordinate } from './region-geometry';

const boundary = JSON.parse(readFileSync(new URL('../public/data/abay-boundary.geojson', import.meta.url), 'utf8')) as Boundary;
const polygons = boundaryPolygons(boundary);
function inside([x, y]: Coordinate, ring: Coordinate[]) {
  let result = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
}
describe('Regional atlas data', () => {
  it('uses valid closed geographic rings and finite projected positions', () => {
    expect(polygons.length).toBeGreaterThan(0);
    for (const rings of polygons) for (const ring of rings) {
      expect(ring.length).toBeGreaterThan(3);
      expect(ring[0]).toEqual(ring.at(-1));
      expect(ring.flatMap(projectCoordinate).every(Number.isFinite)).toBe(true);
    }
  });
  it('places all five existing story points inside the displayed regional boundary', () => {
    expect(places).toHaveLength(5);
    for (const place of places) expect(polygons.some(rings => inside(place.coordinate, rings[0]) && !rings.slice(1).some(ring => inside(place.coordinate, ring))), place.id).toBe(true);
  });
  it('preserves holes and multiple islands when a regional export changes format', () => {
    const ring: Coordinate[] = [[0, 0], [2, 0], [2, 2], [0, 0]];
    expect(boundaryPolygons({ features: [{ geometry: { type: 'MultiPolygon', coordinates: [[ring, ring], [ring]] } }] })).toEqual([[ring, ring], [ring]]);
  });
});
