import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { frameRegion, REGION_OVERVIEW_DIRECTION } from './region-framing';
import { boundaryPolygons, projectCoordinate, type Boundary } from './region-geometry';
import { surfaceHeight } from './region-surface';
import type { ElevationGrid } from './region-terrain';

const boundary = JSON.parse(readFileSync(new URL('../public/data/abay-boundary.geojson', import.meta.url), 'utf8')) as Boundary;
const grid = JSON.parse(readFileSync(new URL('../public/data/abay-elevation.json', import.meta.url), 'utf8')) as ElevationGrid;
const points = boundaryPolygons(boundary).flatMap(rings => rings[0].flatMap(p => {
  const [x, y] = projectCoordinate(p);
  return [new Vector3(x, .36 + (surfaceHeight(grid, p) - .28) * 1.8, -y), new Vector3(x, -.65, -y)];
}));

it.each([.8, 1.3, 2.2, 3])('fills and centres the actual region at aspect %s without cropping', aspect => {
  const camera = new PerspectiveCamera(35, aspect, .1, 100);
  const target = new Vector3();
  frameRegion(camera, points, target, new Vector3(...REGION_OVERVIEW_DIRECTION));
  const projected = points.map(p => p.clone().project(camera));
  const xs = projected.map(p => p.x), ys = projected.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  expect(Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY))).toBeLessThan(.94);
  expect(Math.max(maxX - minX, maxY - minY)).toBeGreaterThan(1.7);
  expect(Math.abs(minX + maxX)).toBeLessThan(.03);
  expect(Math.abs(minY + maxY)).toBeLessThan(.03);
});
