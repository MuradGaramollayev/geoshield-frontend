import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, LngLatLike, Map as MapLibreMap, MapLayerMouseEvent, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { Minus, Plus, Radio, Waypoints } from "lucide-react";
import { fetchCountries, fetchThreatFlows } from "../../services/api";
import type { CountryRisk, ThreatFlowLink } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { RAMP_BY_THEME } from "../../design/tokens";
import { Card, CardHeader, ErrorState, IconButton, SeverityBadge, Skeleton } from "../ui";
import CountryDetailPanel from "../charts/CountryDetailPanel";
import { buildCountryCells, cellsToGeoJSON, countryCentroids } from "./hexCells";

// MapLibre derives its worker URL from its own module URL, which the bundler
// rewrites to a path that does not exist; point it at the bundled worker.
maplibregl.setWorkerUrl(workerUrl);

const SRC = "hexes";
const FILL = "hex-fill";
const EDGE = "hex-edge";
const HOVER = "hex-hover";
const SELECTED = "hex-selected";
const FLOW_SRC = "flows";
const FLOW_LINE = "flow-line";

const PULSE_COUNT = 8;

function emptyStyle(background: string): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [{ id: "bg", type: "background", paint: { "background-color": background } }],
  };
}

/** Quadratic arc between two points, bowed by distance, as a line string. */
function arc(from: [number, number], to: [number, number], segments = 48): [number, number][] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  // control point offset perpendicular to the chord
  const cx = (x1 + x2) / 2 - dy * 0.18;
  const cy = (y1 + y2) / 2 + dx * 0.18 + Math.min(dist * 0.08, 12);
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    points.push([
      mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
      mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
    ]);
  }
  return points;
}

interface HoverState {
  country: CountryRisk;
  x: number;
  y: number;
}

/**
 * Global risk as an H3 hexagon grid on MapLibre, coloured by each country's
 * real risk score. The grid approach follows the reference implementation
 * credited in third-party/h3-hex-map-NOTICE.txt.
 *
 * There is no third-party basemap: the hexes are the land, so the map carries
 * no tile-service dependency or licence, and countries the dataset doesn't
 * score still render — in a neutral tone, so "no data" never reads as "low risk".
 */
export default function HexRiskMap({
  title = "Global risk map",
  description = "Every hexagon is coloured by its country's risk score. Select a country for detail.",
  height = 460,
}: {
  title?: string;
  description?: string;
  height?: number;
}) {
  const th = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  // Holds the map only once its style is loaded, so the layer effects can
  // never run against a half-built (or replaced) instance.
  const [loadedMap, setLoadedMap] = useState<MapLibreMap | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [showFlows, setShowFlows] = useState(false);
  const [params, setParams] = useSearchParams();
  const selected = params.get("country");

  const countries = useAsync(fetchCountries, []);
  const grid = useAsync(() => buildCountryCells(), []);
  const flows = useAsync(() => (showFlows ? fetchThreatFlows(40) : Promise.resolve(null)), [showFlows]);

  const byCode = useMemo(
    () => new Map((countries.data?.countries ?? []).map((c) => [c.code, c])),
    [countries.data],
  );

  const geojson = useMemo(() => {
    if (!grid.data || !countries.data) return null;
    const scores = new Map(countries.data.countries.map((c) => [c.code, c.risk_score]));
    return cellsToGeoJSON(grid.data, scores);
  }, [grid.data, countries.data]);

  const centroids = useMemo(() => (grid.data ? countryCentroids(grid.data) : null), [grid.data]);

  const select = (code: string | null) => {
    const next = new URLSearchParams(params);
    if (code) next.set("country", code);
    else next.delete("country");
    setParams(next, { replace: true });
  };

  // ── map lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: emptyStyle(th.c.surface),
      center: [12, 28] as LngLatLike,
      zoom: 0.9,
      minZoom: 0.5,
      maxZoom: 6,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxPitch: 0,
    });
    mapRef.current = map;
    if (import.meta.env.DEV) (window as unknown as { __hexmap?: MapLibreMap }).__hexmap = map;
    map.touchZoomRotate.disableRotation();
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          "Hexagons: Uber H3 · grid method from H3 Hex Map © FARAD Technologies (Apache-2.0) · Country outlines: Natural Earth",
      }),
      "bottom-right",
    );
    if (import.meta.env.DEV) map.on("error", (e) => console.error("[map]", (e as unknown as { error?: Error }).error?.message ?? e));
    map.on("load", () => setLoadedMap(map));
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setLoadedMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── hex layer ────────────────────────────────────────────────────
  useEffect(() => {
    const map = loadedMap;
    if (!map || !geojson) return;

    const ramp = RAMP_BY_THEME[th.theme].flatMap(([stop, color]) => [stop, color]);
    const fillColor = [
      "case",
      ["has", "score"],
      ["interpolate", ["linear"], ["get", "score"], ...ramp],
      th.c.noData,
    ] as unknown as maplibregl.ExpressionSpecification;

    const source = map.getSource(SRC) as GeoJSONSource | undefined;
    if (!source) {
      map.addSource(SRC, { type: "geojson", data: geojson, promoteId: "code" });
      map.addLayer({
        id: FILL,
        type: "fill",
        source: SRC,
        paint: {
          "fill-color": fillColor,
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 1,
            ["has", "score"], 0.92,
            0.55,
          ],
          "fill-opacity-transition": { duration: 180, delay: 0 },
        },
      });
      map.addLayer({
        id: EDGE,
        type: "line",
        source: SRC,
        paint: {
          "line-color": th.c.surface,
          "line-width": ["interpolate", ["linear"], ["zoom"], 0.5, 0.25, 4, 1.1],
          "line-opacity": 0.75,
        },
      });
      // A wash over the hovered country's cells; stroking each hexagon at this
      // zoom turns the whole country into an outline and hides its colour.
      map.addLayer({
        id: HOVER,
        type: "fill",
        source: SRC,
        filter: ["==", ["get", "code"], ""],
        paint: { "fill-color": th.c.ink, "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: SELECTED,
        type: "line",
        source: SRC,
        filter: ["==", ["get", "code"], ""],
        paint: { "line-color": th.c.accent, "line-width": 2.2 },
      });
    } else {
      source.setData(geojson);
      map.setPaintProperty(FILL, "fill-color", fillColor);
      map.setPaintProperty(EDGE, "line-color", th.c.surface);
      map.setPaintProperty(HOVER, "fill-color", th.c.ink);
      map.setPaintProperty(SELECTED, "line-color", th.c.accent);
    }
    // Update the background in place: setStyle would diff against an empty
    // style and drop the layers added above.
    if (map.getLayer("bg")) map.setPaintProperty("bg", "background-color", th.c.surface);
  }, [loadedMap, geojson, th]);

  // ── interaction ──────────────────────────────────────────────────
  useEffect(() => {
    const map = loadedMap;
    if (!map) return;

    const onMove = (e: MapLayerMouseEvent) => {
      const code = e.features?.[0]?.properties?.code as string | undefined;
      const country = code ? byCode.get(code) : undefined;
      map.getCanvas().style.cursor = country ? "pointer" : "";
      if (map.getLayer(HOVER)) map.setFilter(HOVER, ["==", ["get", "code"], code ?? ""]);
      // Clamped here rather than at render time: the card is 240px wide and
      // must not run off the right edge of the canvas.
      const maxX = map.getCanvas().clientWidth - 256;
      setHover(country ? { country, x: Math.min(e.point.x + 16, maxX), y: e.point.y } : null);
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
      if (map.getLayer(HOVER)) map.setFilter(HOVER, ["==", ["get", "code"], ""]);
      setHover(null);
    };
    const onClick = (e: MapLayerMouseEvent) => {
      const code = e.features?.[0]?.properties?.code as string | undefined;
      if (code && byCode.has(code)) select(code);
    };

    map.on("mousemove", FILL, onMove);
    map.on("mouseleave", FILL, onLeave);
    map.on("click", FILL, onClick);
    map.on("movestart", onLeave);
    return () => {
      map.off("mousemove", FILL, onMove);
      map.off("mouseleave", FILL, onLeave);
      map.off("click", FILL, onClick);
      map.off("movestart", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedMap, byCode, params]);

  // ── selected country outline ─────────────────────────────────────
  useEffect(() => {
    const map = loadedMap;
    if (!map || !map.getLayer(SELECTED)) return;
    map.setFilter(SELECTED, ["==", ["get", "code"], selected ?? ""]);
  }, [loadedMap, selected, geojson]);

  // ── pulse markers on the highest-risk countries ──────────────────
  useEffect(() => {
    const map = loadedMap;
    if (!map || !centroids || !countries.data) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const top = [...countries.data.countries].sort((a, b) => b.risk_score - a.risk_score).slice(0, PULSE_COUNT);
    for (const c of top) {
      const at = centroids.get(c.code);
      if (!at) continue;
      const el = document.createElement("button");
      el.className = "hex-pulse";
      el.type = "button";
      el.setAttribute("aria-label", `${c.name}, risk ${c.risk_score}`);
      el.style.setProperty("--pulse-color", th.riskColor(c.risk_score));
      el.innerHTML = '<span class="hex-pulse-ring"></span><span class="hex-pulse-dot"></span>';
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        select(c.code);
      });
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat(at).addTo(map));
    }
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedMap, centroids, countries.data, th.theme]);

  // ── threat flow arcs ─────────────────────────────────────────────
  useEffect(() => {
    const map = loadedMap;
    if (!map || !centroids) return;
    const links: ThreatFlowLink[] = flows.data?.links ?? [];
    const data: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: showFlows
        ? links.flatMap((l) => {
            const a = centroids.get(l.source);
            const b = centroids.get(l.target);
            if (!a || !b) return [];
            return [{
              type: "Feature" as const,
              properties: { kind: l.kind, weight: l.weight },
              geometry: { type: "LineString" as const, coordinates: arc(a, b) },
            }];
          })
        : [],
    };

    const src = map.getSource(FLOW_SRC) as GeoJSONSource | undefined;
    if (!src) {
      map.addSource(FLOW_SRC, { type: "geojson", data });
      map.addLayer({
        id: FLOW_LINE,
        type: "line",
        source: FLOW_SRC,
        layout: { "line-cap": "round" },
        paint: {
          "line-color": ["case", ["==", ["get", "kind"], "malware"], th.sev.CRITICAL.solid, th.c.accent],
          "line-width": ["interpolate", ["linear"], ["get", "weight"], 1, 0.8, 10, 2.6],
          "line-opacity": 0.75,
          "line-blur": 0.4,
        },
      });
    } else {
      src.setData(data);
      map.setPaintProperty(FLOW_LINE, "line-color", [
        "case", ["==", ["get", "kind"], "malware"], th.sev.CRITICAL.solid, th.c.accent,
      ]);
    }
  }, [loadedMap, showFlows, flows.data, centroids, th]);

  const loading = countries.loading || grid.loading;
  const error = countries.error ?? grid.error;

  return (
    <Card pad="none" className="overflow-hidden">
      <div className="p-[var(--pad-card)] pb-3">
        <CardHeader
          title={title}
          description={description}
          className="mb-0"
          actions={
            <button
              onClick={() => setShowFlows((v) => !v)}
              aria-pressed={showFlows}
              className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-[12px] text-sm font-semibold interactive ${
                showFlows ? "bg-ink-2 text-paper" : "bg-paper text-ink shadow-[var(--shadow-e3)]"
              }`}
            >
              <Waypoints size={15} />
              Threat flow
            </button>
          }
        />
      </div>

      <div className="relative" style={{ height }}>
        <div ref={containerRef} className="h-full w-full" role="application" aria-label="Global risk hexagon map" />

        {(loading || error) && (
          <div className="absolute inset-0 grid place-items-center bg-surface">
            {error ? <ErrorState message={error} onRetry={() => { countries.reload(); grid.reload(); }} className="max-w-md" />
                   : <Skeleton className="absolute inset-0 rounded-none" />}
          </div>
        )}

        {/* zoom */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <IconButton label="Zoom in" size="sm" variant="secondary" onClick={() => mapRef.current?.zoomIn()}>
            <Plus size={15} />
          </IconButton>
          <IconButton label="Zoom out" size="sm" variant="secondary" onClick={() => mapRef.current?.zoomOut()}>
            <Minus size={15} />
          </IconButton>
        </div>

        {/* legend */}
        <div className="e4 absolute bottom-3 left-3 px-4 py-3 w-64">
          <p className="text-xs font-semibold text-ink mb-2">Country risk score</p>
          <div className="h-2 rounded-full" style={{ background: th.rampCss() }} />
          <div className="flex justify-between text-2xs text-text-3 mt-1 num">
            <span>0</span><span>30</span><span>45</span><span>65</span><span>100</span>
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-2xs text-text-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px]" style={{ background: th.c.noData }} /> No data
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Radio size={11} /> Top {PULSE_COUNT} by risk
            </span>
          </div>
          {showFlows && (
            <div className="mt-2.5 pt-2.5 border-t border-line text-2xs text-text-3 space-y-1">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded" style={{ background: th.c.accent }} /> Shared hosting provider
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded" style={{ background: th.sev.CRITICAL.solid }} /> Shared malware family
              </span>
              {flows.data && <span className="block">{flows.data.count} correlations</span>}
            </div>
          )}
        </div>

        {/* hover card */}
        <AnimatePresence>
          {hover && (
            <motion.div
              key="hex-tip"
              className="e4 pointer-events-none absolute z-10 px-4 py-3 w-60"
              style={{ left: hover.x, top: hover.y + 16 }}
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <p className="text-base font-semibold text-ink leading-tight">{hover.country.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="num text-2xl font-medium tracking-[-0.03em]" style={{ color: th.riskColor(hover.country.risk_score) }}>
                  {hover.country.risk_score}
                </span>
                <SeverityBadge severity={hover.country.risk_level} size="xs" />
              </div>
              <p className="text-xs text-text-2 mt-2">
                {hover.country.primary_attack}
                {hover.country.primary_attack_share > 0 && (
                  <span className="num text-text-3"> · {hover.country.primary_attack_share}% of indicators</span>
                )}
              </p>
              <p className="text-xs text-text-3 mt-1">
                <span className="num">{hover.country.total_threats.toLocaleString()}</span> indicators ·{" "}
                {hover.country.trend === "insufficient"
                  ? `trend needs ${2 - hover.country.trend_days} more day${2 - hover.country.trend_days === 1 ? "" : "s"}`
                  : `${hover.country.trend_change > 0 ? "+" : ""}${hover.country.trend_change} pts over ${hover.country.trend_days}d`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CountryDetailPanel countryCode={selected} onClose={() => select(null)} />
    </Card>
  );
}
