import { readFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { places } from './content';
import { boundaryPolygons, projectCoordinate, REGION_CENTRE, type Boundary, type Coordinate } from './region-geometry';
import { geographicPosition, regionalSurface, surfaceHeight, surfaceMetres } from './region-surface';
import type { ElevationGrid } from './region-terrain';

const boundary = JSON.parse(readFileSync(new URL('../public/data/abay-boundary.geojson', import.meta.url), 'utf8')) as Boundary;
const grid = JSON.parse(readFileSync(new URL('../public/data/abay-elevation.json', import.meta.url), 'utf8')) as ElevationGrid;
const polygons = boundaryPolygons(boundary);
const terrain = regionalSurface(polygons[0], grid);

function disposeSurface(result: ReturnType<typeof regionalSurface>) {
  result.surface.dispose();
  result.contours.dispose();
  result.walls.dispose();
}

afterAll(() => disposeSurface(terrain));

describe('Regional surface geometry', () => {
  it('places all five real story markers on the upward-facing rendered triangles', () => {
    const material = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
    const mesh = new THREE.Mesh(terrain.surface, material);
    mesh.updateMatrixWorld(true);
    terrain.surface.computeBoundingBox();
    const rayHeight = terrain.surface.boundingBox!.max.y + 1;
    const raycaster = new THREE.Raycaster();

    try {
      expect(places).toHaveLength(5);
      for (const place of places) {
        const [x, northing] = projectCoordinate(place.coordinate);
        raycaster.set(new THREE.Vector3(x, rayHeight, -northing), new THREE.Vector3(0, -1, 0));
        const hits = raycaster.intersectObject(mesh, false);
        expect(hits.length, place.id).toBeGreaterThan(0);
        expect(hits[0].point.y, place.id).toBeCloseTo(surfaceHeight(grid, place.coordinate), 5);
      }
    } finally {
      material.dispose();
    }
  });

  it('bounds mesh complexity and keeps terrain and no-terrain geometry finite', () => {
    const position = terrain.surface.getAttribute('position');
    const normal = terrain.surface.getAttribute('normal');
    expect(position.count).toBe(grid.width * grid.height);
    expect(position.count).toBeLessThanOrEqual(20_480);
    expect(terrain.surface.getIndex()!.count).toBe(6 * (grid.width - 1) * (grid.height - 1));
    expect(Array.from(position.array).every(Number.isFinite)).toBe(true);
    expect(Array.from(normal.array).every(Number.isFinite)).toBe(true);
    for (let i = 0; i < normal.count; i++) expect(normal.getY(i)).toBeGreaterThan(0);

    const flat = regionalSurface(polygons[0], null);
    try {
      const flatPosition = flat.surface.getAttribute('position');
      expect(flatPosition.count).toBeLessThanOrEqual(20_480);
      expect(Array.from(flatPosition.array).every(Number.isFinite)).toBe(true);
      expect(flat.contours.getAttribute('position').count).toBe(0);
      for (let i = 0; i < flatPosition.count; i++) expect(flatPosition.getY(i)).toBeCloseTo(.28, 6);
    } finally {
      disposeSurface(flat);
    }
  });

  it('round-trips actual boundary and story coordinates without swapping longitude and latitude', () => {
    const coordinates = [
      ...polygons.flatMap(rings => rings.flat()),
      ...places.map(place => place.coordinate),
    ];
    for (const coordinate of coordinates) {
      const restored = geographicPosition(...projectCoordinate(coordinate));
      expect(restored[0]).toBeCloseTo(coordinate[0], 10);
      expect(restored[1]).toBeCloseTo(coordinate[1], 10);
    }
    expect(projectCoordinate(REGION_CENTRE)).toEqual([0, 0]);
    expect(projectCoordinate([REGION_CENTRE[0] + 1, REGION_CENTRE[1]])[0]).toBeGreaterThan(0);
    expect(projectCoordinate([REGION_CENTRE[0], REGION_CENTRE[1] + 1])[1]).toBeGreaterThan(0);
  });

  it('samples the NE–SW triangles rather than bilinearly bending a non-planar grid cell', () => {
    const fixture: ElevationGrid = {
      version: 1,
      bbox: [80, 48, 81, 49],
      width: 2,
      height: 2,
      elevations: [200, 300, 600, 1200],
    };
    const samples: [Coordinate, number][] = [
      [[80, 49], 200],
      [[81, 49], 300],
      [[80, 48], 600],
      [[81, 48], 1200],
      [[80.25, 48.75], 325],
      [[80.75, 48.25], 825],
      [[80.5, 48.5], 450],
    ];
    for (const [coordinate, expected] of samples) {
      expect(surfaceMetres(fixture, coordinate)).toBeCloseTo(expected, 8);
    }
  });
});
