/**
 * One bounded OpenFreeMap regional extract: 12 z7 vector tiles, two workers,
 * no crawling, no Overpass and no retries. Uses existing transitive packages;
 * it does not add application dependencies. Run: node scripts/prepare-abay-water.mjs
 * Source/access policy: https://openfreemap.org/quick_start/
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';

const root = fileURLToPath(new URL('../', import.meta.url));
const styleUrl = 'https://tiles.openfreemap.org/styles/liberty';
const zoom = 7, concurrency = 2, toleranceMetres = 4000;
const userAgent = 'IZQOR-Abai-Water-Extract/1.0 (12-tile educational regional extract)';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(url, binary = false) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: { 'User-Agent': userAgent } });
  if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}; bounded extraction stops without retry.`);
  return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
}
const round = point => [Number(point[0].toFixed(6)), Number(point[1].toFixed(6))];
function extent(geometry) {
  const bounds = [180, 90, -180, -90];
  function visit(array) {
    if (typeof array[0] === 'number') {
      bounds[0] = Math.min(bounds[0], array[0]); bounds[1] = Math.min(bounds[1], array[1]);
      bounds[2] = Math.max(bounds[2], array[0]); bounds[3] = Math.max(bounds[3], array[1]);
    } else array.forEach(visit);
  }
  visit(geometry.coordinates); return bounds;
}
function overlaps(a, b) { return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]; }
function countVertices(geometry) {
  return geometry.type === 'LineString' ? geometry.coordinates.length : geometry.coordinates.reduce((n, ring) => n + ring.length, 0);
}
const metresPerDegree = 111195, longitudeScale = Math.cos(48.62 * Math.PI / 180) * metresPerDegree;
const metric = p => [p[0] * longitudeScale, p[1] * metresPerDegree];
function distanceToSegmentSquared(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
}
function simplifyLine(points, tolerance = toleranceMetres) {
  if (points.length <= 2) return points.map(round);
  const projected = points.map(metric), keep = new Uint8Array(points.length), stack = [[0, points.length - 1]];
  keep[0] = keep[points.length - 1] = 1;
  while (stack.length) {
    const [start, end] = stack.pop(); let maximum = tolerance * tolerance, chosen = -1;
    for (let i = start + 1; i < end; i++) {
      const distance = distanceToSegmentSquared(projected[i], projected[start], projected[end]);
      if (distance > maximum) { maximum = distance; chosen = i; }
    }
    if (chosen >= 0) { keep[chosen] = 1; stack.push([start, chosen], [chosen, end]); }
  }
  return points.filter((_, i) => keep[i]).map(round);
}
function signedArea(ring) {
  let sum = 0;
  for (let i = 1; i < ring.length; i++) sum += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1];
  return sum / 2;
}
function contains(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
function selfIntersects(ring) {
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  for (let i = 0; i < ring.length - 1; i++) for (let j = i + 2; j < ring.length - 1; j++) {
    if (i === 0 && j === ring.length - 2) continue;
    const a = ring[i], b = ring[i + 1], c = ring[j], d = ring[j + 1];
    if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
  }
  return false;
}
function simplifyRing(ring) {
  const original = ring.map(round), area = signedArea(original), simplified = simplifyLine(original);
  // A small lake/hole must never disappear. Keep the original if area changes
  // substantially, orientation flips, or simplification creates a crossing.
  if (simplified.length < 4 || Math.sign(signedArea(simplified)) !== Math.sign(area) ||
    Math.abs(signedArea(simplified) - area) > Math.abs(area) * .15 || selfIntersects(simplified)) return original;
  return simplified;
}
function simplifyPolygon(rings) {
  const simplified = rings.map(simplifyRing);
  // Keep islands within their lake after shoreline generalization.
  if (simplified.slice(1).some(ring => !contains(ring[0], simplified[0]))) simplified[0] = rings[0].map(round);
  return simplified;
}
function parts(geometry) {
  if (geometry.type === 'LineString' || geometry.type === 'Polygon') return [geometry];
  if (geometry.type === 'MultiLineString') return geometry.coordinates.map(coordinates => ({ type: 'LineString', coordinates }));
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(coordinates => ({ type: 'Polygon', coordinates }));
  return [];
}
function tileBounds(x, y) {
  const n = 2 ** zoom, latitude = row => Math.atan(Math.sinh(Math.PI * (1 - 2 * row / n))) * 180 / Math.PI;
  return [x / n * 360 - 180, latitude(y + 1), (x + 1) / n * 360 - 180, latitude(y)];
}
function clipSegment(a, b, box) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; let start = 0, end = 1;
  const p = [-dx, dx, -dy, dy], q = [a[0] - box[0], box[2] - a[0], a[1] - box[1], box[3] - a[1]];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return null; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) start = Math.max(start, t); else end = Math.min(end, t);
    if (start > end) return null;
  }
  const result = [round([a[0] + start * dx, a[1] + start * dy]), round([a[0] + end * dx, a[1] + end * dy])];
  return JSON.stringify(result[0]) === JSON.stringify(result[1]) ? null : result;
}
function removeLineBuffer(feature) {
  if (feature.geometry.type !== 'LineString') return [feature];
  const [, x, y] = feature.properties.source_tile.split('/').map(Number), box = tileBounds(x, y), fragments = [];
  let current = [];
  for (let i = 1; i < feature.geometry.coordinates.length; i++) {
    const clipped = clipSegment(feature.geometry.coordinates[i - 1], feature.geometry.coordinates[i], box);
    if (!clipped) { if (current.length > 1) fragments.push(current); current = []; continue; }
    if (current.length && JSON.stringify(current.at(-1)) !== JSON.stringify(clipped[0])) { fragments.push(current); current = []; }
    if (!current.length) current.push(clipped[0]); current.push(clipped[1]);
  }
  if (current.length > 1) fragments.push(current);
  return fragments.map((coordinates, i) => ({ ...feature, id: fragments.length > 1 ? `${feature.id}-clip${i}` : feature.id,
    properties: { ...feature.properties, vertices_before_simplification: i ? 0 : feature.properties.vertices_before_simplification },
    geometry: { type: 'LineString', coordinates } }));
}
function updateSummary(output) {
  const bounds = [180, 90, -180, -90];
  for (const feature of output.features) { const b = extent(feature.geometry); bounds[0] = Math.min(bounds[0], b[0]); bounds[1] = Math.min(bounds[1], b[1]); bounds[2] = Math.max(bounds[2], b[2]); bounds[3] = Math.max(bounds[3], b[3]); }
  output.bbox = bounds; output.metadata.featureCount = output.features.length;
  output.metadata.lineCount = output.features.filter(f => f.geometry.type === 'LineString').length;
  output.metadata.polygonCount = output.features.filter(f => f.geometry.type === 'Polygon').length;
  output.metadata.vertexCount = output.features.reduce((n, f) => n + countVertices(f.geometry), 0);
  output.metadata.tileBufferProcessing = 'LineString fragments clipped to their true XYZ tile bounds to remove artificial line connections in MVT padding. Polygons retain their source buffer; clip filled water to the region boundary.';
  return output;
}

async function main() {
  if (process.argv.includes('--clean-existing')) {
    const destination = join(root, 'public/data/abay-water.geojson'), output = JSON.parse(await readFile(destination, 'utf8'));
    output.features = output.features.flatMap(removeLineBuffer); updateSummary(output);
    await writeFile(destination, JSON.stringify(output) + '\n');
    console.log(JSON.stringify({ mode: 'local-only buffer cleanup; zero network requests', features: output.features.length, lines: output.metadata.lineCount, polygons: output.metadata.polygonCount, bytes: Buffer.byteLength(JSON.stringify(output)) })); return;
  }
  const { bbox } = JSON.parse(await readFile(join(root, 'public/data/abay-elevation.json'), 'utf8'));
  const style = await request(styleUrl), source = style.sources.openmaptiles;
  if (!source?.url) throw new Error('The style does not publish an OpenMapTiles source URL.');
  const tileJson = await request(source.url), tileTemplate = tileJson.tiles?.[0];
  if (!tileTemplate?.includes('{z}')) throw new Error('Missing XYZ tile URL.');
  const jobs = [];
  for (let y = 42; y <= 45; y++) for (let x = 91; x <= 93; x++) jobs.push({ x, y, url: tileTemplate.replace('{z}', zoom).replace('{x}', x).replace('{y}', y) });
  if (jobs.length !== 12) throw new Error('This script is limited to exactly twelve regional tiles.');
  console.log(JSON.stringify({ zoom, tileCount: jobs.length, concurrency, bbox, tileTemplate }));
  const results = new Array(jobs.length); let next = 0, failed = false, totalBytes = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (!failed && next < jobs.length) {
      const index = next++, job = jobs[index];
      try {
        const bytes = await request(job.url, true); totalBytes += bytes.length;
        if (bytes.length > 4_000_000 || totalBytes > 50_000_000) throw new Error('Regional extract exceeded its byte budget.');
        const tile = new VectorTile(new PbfReader(bytes)), features = [], counts = {};
        for (const layerName of ['water', 'waterway']) {
          const layer = tile.layers[layerName]; if (!layer) continue;
          counts[layerName] = layer.length;
          for (let i = 0; i < layer.length; i++) {
            const item = layer.feature(i), feature = item.toGeoJSON(job.x, job.y, zoom);
            for (const [partIndex, geometry] of parts(feature.geometry).entries()) {
              if (!overlaps(extent(geometry), bbox)) continue;
              const before = countVertices(geometry);
              const coordinates = geometry.type === 'LineString' ? simplifyLine(geometry.coordinates) : simplifyPolygon(geometry.coordinates);
              if (geometry.type === 'LineString' && coordinates.length < 2) continue;
              const properties = { source_layer: layerName, source_tile: `${zoom}/${job.x}/${job.y}`, source_feature_id: item.id ?? null,
                class: feature.properties.class ?? (layerName === 'waterway' ? 'river' : 'water'),
                vertices_before_simplification: before };
              for (const key of ['name', 'name:kk', 'name:ru', 'name:en', 'intermittent', 'brunnel']) if (feature.properties[key] !== undefined) properties[key] = feature.properties[key];
              features.push({ type: 'Feature', id: `ofm-${zoom}-${job.x}-${job.y}-${layerName}-${i}-${partIndex}`, properties, geometry: { type: geometry.type, coordinates } });
            }
          }
        }
        results[index] = { features, source: { x: job.x, y: job.y, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), layers: counts } };
        console.log(`Decoded ${zoom}/${job.x}/${job.y}: ${bytes.length} bytes, ${features.length} water features`);
        await pause(100);
      } catch (error) { failed = true; throw error; }
    }
  });
  const finished = await Promise.allSettled(workers), error = finished.find(item => item.status === 'rejected');
  if (error) throw error.reason;
  const seen = new Set(), features = [];
  for (const result of results) for (const feature of result.features.flatMap(removeLineBuffer)) {
    const key = JSON.stringify(feature.geometry);
    if (!seen.has(key)) { seen.add(key); features.push(feature); }
  }
  if (!features.length) throw new Error('No water geometry was returned; no fabricated waterways are written.');
  const bounds = [180, 90, -180, -90];
  for (const feature of features) { const b = extent(feature.geometry); bounds[0] = Math.min(bounds[0], b[0]); bounds[1] = Math.min(bounds[1], b[1]); bounds[2] = Math.max(bounds[2], b[2]); bounds[3] = Math.max(bounds[3], b[3]); }
  const named = [...new Set(features.map(feature => feature.properties.name).filter(Boolean))];
  const output = { type: 'FeatureCollection', bbox: bounds,
    metadata: {
      provider: 'OpenFreeMap / OpenMapTiles / OpenStreetMap contributors',
      attribution: tileJson.attribution ?? '© OpenFreeMap; © OpenMapTiles; © OpenStreetMap contributors',
      attributionLinks: ['https://openfreemap.org/', 'https://www.openmaptiles.org/', 'https://www.openstreetmap.org/copyright'],
      license: 'OpenStreetMap-derived water data: ODbL 1.0; retain contributor attribution and observe the database licence.',
      styleUrl, sourceTileJsonUrl: source.url, sourceTileTemplate: tileTemplate,
      sourceUrls: jobs.map(job => job.url), sourceTiles: results.map(result => result.source),
      sourceZoom: zoom, extractionAreaBbox: bbox, sourceResponseBytes: totalBytes, retrievedAt: new Date().toISOString(),
      crs: 'EPSG:4326', simplificationToleranceMetres: toleranceMetres,
      processing: 'Extracted only water/waterway layers; Multi geometries split into LineString/Polygon parts. Douglas–Peucker in a local metric projection with original ring fallback for disappearing lakes/holes, >15% area change, self-crossings or lost islands. Six decimal coordinate rounding. Exact duplicate geometry removed; adjacent tile fragments intentionally preserved.',
      clipping: 'Features intersect the extraction area but retain full source tile fragments. The renderer must clip them to the Abai region boundary; bbox records actual output geometry extent.',
      limitations: 'Generalized z7 source geometry, not a complete river inventory or navigation chart. Small tributaries omitted by the source at this zoom cannot be restored. No hand-drawn or inferred rivers were substituted.',
      featureCount: features.length, lineCount: features.filter(feature => feature.geometry.type === 'LineString').length,
      polygonCount: features.filter(feature => feature.geometry.type === 'Polygon').length,
      vertexCount: features.reduce((sum, feature) => sum + countVertices(feature.geometry), 0),
      vertexCountBeforeSimplification: features.reduce((sum, feature) => sum + feature.properties.vertices_before_simplification, 0),
      sourceNames: named,
    }, features };
  const destination = join(root, 'public/data/abay-water.geojson');
  updateSummary(output);
  await writeFile(destination, JSON.stringify(output) + '\n');
  console.log(JSON.stringify({ destination, bytes: Buffer.byteLength(JSON.stringify(output)), lines: output.metadata.lineCount, polygons: output.metadata.polygonCount, vertices: output.metadata.vertexCount, before: output.metadata.vertexCountBeforeSimplification, named }));
}
main().catch(error => { console.error(`Water extract failed; existing output is retained: ${error.message}`); process.exitCode = 1; });
