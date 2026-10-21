/**
 * Prepare a small, genuine regional elevation grid from Mapterhorn Terrarium tiles.
 * Run: node scripts/prepare-abay-elevation.mjs
 * Requires Node 22+ and sharp. Set SHARP_MODULE to an absolute sharp package path
 * when it is not installed locally. No API key or full-planet download is used.
 *
 * Sources: https://mapterhorn.com/data-access/ and https://mapterhorn.com/attribution/
 * RGB decoding is numeric, before interpolation: R * 256 + G + B / 256 - 32768.
 * Do not resize the RGB image: interpolation across RGB carries would corrupt heights.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const width = 128, height = 160, zoom = 7, tileSize = 512, concurrency = 2;
const maxTiles = 16, maxTileBytes = 3_000_000;
const endpoint = 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp';
const docsUrl = 'https://mapterhorn.com/data-access/';
const attributionUrl = 'https://mapterhorn.com/attribution/';
const catalogUrl = 'https://download.mapterhorn.com/attribution.json';

function loadSharp() {
  if (process.env.SHARP_MODULE) return require(process.env.SHARP_MODULE);
  try { return require('sharp'); } catch {
    const bundled = join(process.env.USERPROFILE ?? '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules', 'sharp');
    try { return require(bundled); } catch {
      throw new Error('sharp is unavailable. Set SHARP_MODULE to an existing sharp package directory.');
    }
  }
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(url, binary = false) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: { 'User-Agent': 'IZQOR-regional-terrain/1.0 (bounded educational area extract)' } });
      if (response.status === 429) throw new Error(`Rate limit at ${url}; stop rather than retrying.`);
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      if (!binary) return await response.json();
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > maxTileBytes) throw new Error(`Tile exceeds the ${maxTileBytes} byte limit: ${url}`);
      return bytes;
    } catch (error) {
      if (attempt || String(error).includes('Rate limit')) throw error;
      await pause(700);
    }
  }
}

function visitPositions(value, collect) {
  if (typeof value[0] === 'number') collect(value); else value.forEach(item => visitPositions(item, collect));
}
function paddedBounds(boundary) {
  const bounds = [180, 90, -180, -90];
  for (const feature of boundary.features) visitPositions(feature.geometry.coordinates, point => {
    bounds[0] = Math.min(bounds[0], point[0]); bounds[1] = Math.min(bounds[1], point[1]);
    bounds[2] = Math.max(bounds[2], point[0]); bounds[3] = Math.max(bounds[3], point[1]);
  });
  if (!bounds.every(Number.isFinite) || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error('Invalid boundary bounds.');
  const dx = (bounds[2] - bounds[0]) * .01, dy = (bounds[3] - bounds[1]) * .01;
  return { boundaryBounds: bounds, bbox: [bounds[0] - dx, bounds[1] - dy, bounds[2] + dx, bounds[3] + dy] };
}
function worldPixel(longitude, latitude) {
  const size = 2 ** zoom * tileSize;
  // Pixel centres lie at half-integer positions in the global slippy-map plane.
  return [(longitude + 180) / 360 * size - .5,
    (1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * size - .5];
}
function tileUrl(x, y) { return endpoint.replace('{z}', zoom).replace('{x}', x).replace('{y}', y); }

async function main() {
  const sharp = loadSharp();
  const boundary = JSON.parse(await readFile(join(root, 'public/data/abay-boundary.geojson'), 'utf8'));
  const { bbox, boundaryBounds } = paddedBounds(boundary);
  const northWest = worldPixel(bbox[0], bbox[3]), southEast = worldPixel(bbox[2], bbox[1]);
  const minX = Math.floor(Math.floor(northWest[0]) / tileSize), maxX = Math.floor(Math.ceil(southEast[0]) / tileSize);
  const minY = Math.floor(Math.floor(northWest[1]) / tileSize), maxY = Math.floor(Math.ceil(southEast[1]) / tileSize);
  const jobs = [];
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) jobs.push({ x, y });
  if (jobs.length > maxTiles) throw new Error(`Refusing ${jobs.length} tiles; maximum is ${maxTiles}.`);
  console.log(JSON.stringify({ bbox, grid: [width, height], zoom, tiles: jobs.length, concurrency }));
  // Metadata requests are small; image downloads below remain bounded to two workers.
  const [tileJson, attributionCatalog] = await Promise.all([
    request('https://tiles.mapterhorn.com/tilejson.json'), request(catalogUrl),
  ]);
  if (tileJson.encoding !== 'terrarium' || tileJson.tileSize !== tileSize) throw new Error('Unexpected provider encoding or tile size.');
  const tiles = new Map();
  let next = 0, failed = false;
  const workers = Array.from({ length: concurrency }, async () => {
    while (!failed && next < jobs.length) {
      const job = jobs[next++], url = tileUrl(job.x, job.y);
      try {
        const image = await request(url, true);
        const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        if (info.width !== tileSize || info.height !== tileSize || info.channels !== 3) throw new Error(`Unexpected tile dimensions/channels at ${url}`);
        tiles.set(`${job.x}/${job.y}`, { data, url, bytes: image.length, sha256: createHash('sha256').update(image).digest('hex') });
        console.log(`Decoded ${zoom}/${job.x}/${job.y}: ${image.length} bytes`);
        await pause(100);
      } catch (error) { failed = true; throw error; }
    }
  });
  const completed = await Promise.allSettled(workers);
  const failure = completed.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
  function pixelElevation(x, y) {
    const tx = Math.floor(x / tileSize), ty = Math.floor(y / tileSize), tile = tiles.get(`${tx}/${ty}`);
    if (!tile) throw new Error(`Missing source tile ${zoom}/${tx}/${ty}; no synthetic fallback is written.`);
    const offset = ((y - ty * tileSize) * tileSize + x - tx * tileSize) * 3;
    return tile.data[offset] * 256 + tile.data[offset + 1] + tile.data[offset + 2] / 256 - 32768;
  }
  function sampleSource(longitude, latitude) {
    const [px, py] = worldPixel(longitude, latitude), x = Math.floor(px), y = Math.floor(py), u = px - x, v = py - y;
    const north = pixelElevation(x, y) * (1 - u) + pixelElevation(x + 1, y) * u;
    const south = pixelElevation(x, y + 1) * (1 - u) + pixelElevation(x + 1, y + 1) * u;
    return north * (1 - v) + south * v;
  }
  const elevations = [];
  for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
    const longitude = bbox[0] + (bbox[2] - bbox[0]) * col / (width - 1);
    const latitude = bbox[3] - (bbox[3] - bbox[1]) * row / (height - 1);
    const elevation = Math.round(sampleSource(longitude, latitude));
    if (!Number.isFinite(elevation) || elevation < -500 || elevation > 9000) throw new Error(`Invalid decoded elevation at ${longitude}, ${latitude}`);
    elevations.push(elevation);
  }
  const centreLatitude = (bbox[1] + bbox[3]) / 2, latitudeMetresPerDegree = 111_195;
  const controlSamples = [
    { name: 'Semey — Alash museum area', longitude: 80.25629, latitude: 50.40702 },
    { name: 'Zhidebay settlement', longitude: 79.3212356, latitude: 49.1077518 },
  ].map(point => ({ ...point, sourceElevationMetres: Math.round(sampleSource(point.longitude, point.latitude) * 100) / 100 }));
  const globalSource = attributionCatalog.find(item => item.source === 'glo30');
  const grid = {
    version: 1,
    bbox, width, height, units: 'metres', crs: 'EPSG:4326', rowOrder: 'north_to_south', columnOrder: 'west_to_east',
    elevations,
    minElevation: Math.min(...elevations), maxElevation: Math.max(...elevations),
    provenance: {
      provider: 'Mapterhorn', docsUrl, attributionUrl, attributionCatalogUrl: catalogUrl,
      attribution: tileJson.attribution,
      upstreamGlobalDatasetListedByProvider: globalSource ? { name: globalSource.name, producer: globalSource.producer, license: globalSource.license, website: globalSource.website, licenseUrl: globalSource.license_pdf } : null,
      sourceEncoding: 'Terrarium RGB: R * 256 + G + B / 256 - 32768', sourceZoom: zoom, sourceTileSize: tileSize,
      sourceUrls: jobs.map(({ x, y }) => tileUrl(x, y)),
      sourceTiles: jobs.map(({ x, y }) => { const tile = tiles.get(`${x}/${y}`); return { x, y, bytes: tile.bytes, sha256: tile.sha256 }; }),
      retrievedAt: new Date().toISOString(), boundaryBounds, boundaryPaddingFractionPerSide: .01,
      processing: 'Bilinear sampling of decoded source elevations at an evenly spaced longitude/latitude grid; rounded once to integer metres. No invented elevations, RGB resizing, smoothing, or vertical exaggeration is baked into this asset.',
      verticalDatum: 'Values retained as served by Mapterhorn; a unified vertical datum was not independently established.',
      upstreamCoverageNote: 'The full provider attribution catalog is authoritative. The listed global dataset does not certify per-pixel source coverage.',
      approximateSourcePixelMetresAtCentre: Math.round(2 * Math.PI * 6378137 * Math.cos(centreLatitude * Math.PI / 180) / (2 ** zoom * tileSize)),
      approximateGridSpacingMetresAtCentre: [Math.round((bbox[2] - bbox[0]) * latitudeMetresPerDegree * Math.cos(centreLatitude * Math.PI / 180) / (width - 1)), Math.round((bbox[3] - bbox[1]) * latitudeMetresPerDegree / (height - 1))],
      purpose: 'Coarse regional relief for an educational overview. Not suitable for navigation, route safety, engineering, surveying, or exact site/building elevations. The rectangular grid includes land outside the region; the renderer must clip to the actual boundary.',
      controlSamples,
    },
  };
  const output = join(root, 'public/data/abay-elevation.json');
  await mkdir(join(root, 'public/data'), { recursive: true });
  // The previous local asset is untouched unless all source downloads and checks succeed.
  await writeFile(output, JSON.stringify(grid) + '\n');
  console.log(JSON.stringify({ output, bytes: Buffer.byteLength(JSON.stringify(grid)), min: grid.minElevation, max: grid.maxElevation, controlSamples }));
}

main().catch(error => { console.error(`Elevation preparation failed; no synthetic terrain was substituted: ${error.message}`); process.exitCode = 1; });
