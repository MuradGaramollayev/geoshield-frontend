import { cellToBoundary, cellToLatLng, latLngToCell, polygonToCells } from "h3-js";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import { isoNumericToAlpha2 } from "../../data/isoNumericToAlpha2";

/**
 * Turns the country topology into an H3 hexagon grid, tagging every cell with
 * the country it falls in, so the map can be coloured from real per-country
 * risk scores.
 *
 * The grid method (H3 cells rendered on MapLibre) follows the reference
 * implementation noted in third-party/h3-hex-map-NOTICE.txt.
 */

const TOPOLOGY_URL = "/data/countries-110m.json";

export const DEFAULT_RESOLUTION = 3;

export interface CountryCells {
  /** country alpha-2 -> H3 cell ids */
  byCountry: Map<string, string[]>;
  /** H3 cell id -> country alpha-2 (border cells resolve to one country) */
  cellCountry: Map<string, string>;
}

let topologyPromise: Promise<Feature<Polygon | MultiPolygon, { name?: string }>[]> | null = null;
const cache = new Map<number, CountryCells>();

async function countryFeatures() {
  if (!topologyPromise) {
    topologyPromise = fetch(TOPOLOGY_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Country topology unavailable (${r.status})`);
        return r.json() as Promise<Topology<{ countries: GeometryCollection<{ name?: string }> }>>;
      })
      .then((topo) => {
        const fc = feature(topo, topo.objects.countries);
        return fc.features as Feature<Polygon | MultiPolygon, { name?: string }>[];
      })
      .catch((err) => {
        topologyPromise = null;
        throw err;
      });
  }
  return topologyPromise;
}

/** Ray casting on a [lng, lat] ring. */
function pointInRing(lat: number, lng: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Sutherland-Hodgman clip of a ring to a longitude range. */
function clipLng(ring: Position[], min: number, max: number): Position[] {
  let out = ring;
  for (const [keepAbove, bound] of [[true, min], [false, max]] as const) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const curIn = keepAbove ? cur[0] >= bound : cur[0] <= bound;
      const prevIn = keepAbove ? prev[0] >= bound : prev[0] <= bound;
      if (curIn !== prevIn && cur[0] !== prev[0]) {
        const t = (bound - prev[0]) / (cur[0] - prev[0]);
        out.push([bound, prev[1] + t * (cur[1] - prev[1])]);
      }
      if (curIn) out.push(cur);
    }
    if (out.length < 3) return [];
  }
  return out;
}

/**
 * h3 reads longitudes literally, so a ring that steps from +179 to -179
 * (Russia, Fiji, Kiribati) is treated as wrapping the long way round and fills
 * a band across the whole map. Such rings are cut at the antimeridian into an
 * eastern and a western piece, each of which is well behaved.
 */
function splitAtAntimeridian(ring: Position[]): Position[][] {
  const crosses = ring.some((p, i) => i > 0 && Math.abs(p[0] - ring[i - 1][0]) > 180);
  if (!crosses) return [ring];
  const shifted = ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat] as Position);
  const east = clipLng(shifted, 0, 179.999);
  const west = clipLng(shifted, 180.001, 360).map(([lng, lat]) => [lng - 360, lat] as Position);
  const parts = [east, west].filter((r) => r.length >= 3);
  return parts.length ? parts : [ring];
}

/**
 * Cells covering one polygon. h3 rejects a few polygons outright (North Korea's
 * in this dataset), so those fall back to the bounding box filtered by a
 * point-in-polygon test rather than being dropped.
 */
function cellsForPolygon(rings: Position[][], resolution: number): string[] {
  const parts = splitAtAntimeridian(rings[0] ?? []);
  if (parts.length > 1) return parts.flatMap((part) => cellsForRings([part], resolution));
  return cellsForRings(rings, resolution);
}

function cellsForRings(rings: Position[][], resolution: number): string[] {
  try {
    return polygonToCells(rings as number[][][], resolution, true);
  } catch {
    const outer = rings[0];
    if (!outer?.length) return [];
    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;
    for (const [lng, lat] of outer) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
    const bbox = [[
      [minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat],
    ]];
    try {
      return polygonToCells(bbox as number[][][], resolution, true).filter((cell) => {
        const [lat, lng] = cellToLatLng(cell);
        return pointInRing(lat, lng, outer);
      });
    } catch {
      return [];
    }
  }
}

function largestRingCentroid(geom: Polygon | MultiPolygon): [number, number] | null {
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  let best: Position[] | null = null;
  for (const poly of polys) {
    const ring = poly[0];
    if (ring && (!best || ring.length > best.length)) best = ring;
  }
  if (!best?.length) return null;
  let lat = 0;
  let lng = 0;
  for (const [x, y] of best) {
    lng += x;
    lat += y;
  }
  return [lat / best.length, lng / best.length];
}

/** Country -> H3 cells for the whole world, computed once per resolution. */
export async function buildCountryCells(resolution = DEFAULT_RESOLUTION): Promise<CountryCells> {
  const cached = cache.get(resolution);
  if (cached) return cached;

  const features = await countryFeatures();
  const byCountry = new Map<string, string[]>();
  const cellCountry = new Map<string, string>();

  for (const f of features) {
    const code = isoNumericToAlpha2[String(f.id).padStart(3, "0")];
    if (!code) continue;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const cells: string[] = [];
    for (const poly of polys) cells.push(...cellsForPolygon(poly, resolution));

    // Countries smaller than one cell (Luxembourg, Cyprus, Brunei…) still need
    // to appear, so they take the cell their centroid falls in.
    if (cells.length === 0) {
      const centroid = largestRingCentroid(f.geometry);
      if (centroid) cells.push(latLngToCell(centroid[0], centroid[1], resolution));
    }

    if (!cells.length) continue;
    const existing = byCountry.get(code) ?? [];
    byCountry.set(code, existing.concat(cells));
    for (const cell of cells) if (!cellCountry.has(cell)) cellCountry.set(cell, code);
  }

  const result = { byCountry, cellCountry };
  cache.set(resolution, result);
  return result;
}

export interface HexProperties extends Record<string, unknown> {
  code: string;
  /** Present only for countries the dataset scores; absence means "no data". */
  score?: number;
}

/**
 * GeoJSON for every country's cells. Countries the dataset doesn't score are
 * included without a score so they still render as land in a neutral tone —
 * "no data" has to look different from "low risk", not disappear.
 */
/**
 * A cell sitting on the antimeridian comes back with longitudes on both sides
 * of 180, which renders as a stripe across the whole map. Keeping every point
 * within 180 degrees of the first one makes the ring continuous again.
 */
function unwrapRing(ring: number[][]): number[][] {
  const base = ring[0]?.[0] ?? 0;
  return ring.map(([lng, lat]) => [lng - base > 180 ? lng - 360 : lng - base < -180 ? lng + 360 : lng, lat]);
}

export function cellsToGeoJSON(
  cells: CountryCells,
  scores: Map<string, number>,
): GeoJSON.FeatureCollection<GeoJSON.Polygon, HexProperties> {
  const features: GeoJSON.Feature<GeoJSON.Polygon, HexProperties>[] = [];
  for (const [code, ids] of cells.byCountry) {
    const score = scores.get(code);
    for (const id of ids) {
      if (cells.cellCountry.get(id) !== code) continue; // border cell owned by another country
      features.push({
        type: "Feature",
        id,
        properties: score === undefined ? { code } : { code, score },
        geometry: { type: "Polygon", coordinates: [unwrapRing(cellToBoundary(id, true))] },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

/** Mean position of a country's cells, for placing markers and flow arcs. */
export function countryCentroids(cells: CountryCells): Map<string, [number, number]> {
  const out = new Map<string, [number, number]>();
  for (const [code, ids] of cells.byCountry) {
    if (!ids.length) continue;
    let lat = 0;
    let lng = 0;
    for (const id of ids) {
      const [a, b] = cellToLatLng(id);
      lat += a;
      lng += b;
    }
    out.set(code, [lng / ids.length, lat / ids.length]);
  }
  return out;
}
