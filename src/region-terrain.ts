/** A genuine Mapterhorn elevation grid, row-major from north-west to south-east. */
export interface ElevationGrid {
  version: number;
  /** [west, south, east, north], EPSG:4326 longitude/latitude. */
  bbox: [number, number, number, number];
  width: number;
  height: number;
  /** Decoded terrain heights in metres; exactly width * height integer values. */
  elevations: number[];
  units?: string;
  rowOrder?: 'north_to_south';
  columnOrder?: 'west_to_east';
}

/**
 * Bilinear interpolation of the prepared metre values; no visual exaggeration.
 * Out-of-bounds coordinates clamp to the nearest edge. Invalid inputs/data return
 * NaN so the caller can choose its own explicit unavailable-terrain fallback.
 */
export function sampleElevation(grid: ElevationGrid, longitude: number, latitude: number): number {
  const { bbox: [west, south, east, north], width, height, elevations } = grid;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || width < 2 || height < 2 ||
    elevations.length !== width * height || !(east > west) || !(north > south)) return Number.NaN;
  const x = Math.max(0, Math.min(width - 1, (longitude - west) / (east - west) * (width - 1)));
  const y = Math.max(0, Math.min(height - 1, (north - latitude) / (north - south) * (height - 1)));
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, height - 1);
  const u = x - x0, v = y - y0;
  const a = elevations[y0 * width + x0], b = elevations[y0 * width + x1];
  const c = elevations[y1 * width + x0], d = elevations[y1 * width + x1];
  if (![a, b, c, d].every(Number.isFinite)) return Number.NaN;
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
