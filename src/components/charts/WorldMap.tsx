import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { fetchCountries } from "../../services/api";
import type { CountryRisk } from "../../services/api";
import { isoNumericToAlpha2 } from "../../data/isoNumericToAlpha2";
import CountryDetailPanel from "./CountryDetailPanel";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#f43f5e",
  HIGH: "#fb923c",
  MEDIUM: "#fbbf24",
  LOW: "#34d399",
};
const NO_DATA_COLOR = "rgba(148,163,184,0.12)";

export default function WorldMap() {
  const [countries, setCountries] = useState<Record<string, CountryRisk>>({});
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CountryRisk | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries()
      .then((data) => {
        const map: Record<string, CountryRisk> = {};
        for (const c of data.countries) {
          map[c.code] = c;
        }
        setCountries(map);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="card-glow p-6 text-rose-400 text-sm">
        Failed to load map data: {error}
      </div>
    );
  }

  return (
    <div className="card-glow p-5 relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Global Risk Map
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR.LOW }} />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR.MEDIUM }} />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR.HIGH }} />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR.CRITICAL }} />
            Critical
          </span>
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projectionConfig={{ scale: 130 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = String(geo.id).padStart(3, "0");
                const alpha2 = isoNumericToAlpha2[numericId];
                const data = alpha2 ? countries[alpha2] : undefined;
                const fill = data ? RISK_COLOR[data.risk_level] : NO_DATA_COLOR;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => data && setHovered(data)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => data && setSelectedCode(data.code)}
                    style={{
                      default: {
                        fill,
                        stroke: "#0b1220",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: data ? fill : NO_DATA_COLOR,
                        stroke: "#38bdf8",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: data ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {hovered && (
          <div className="absolute top-2 left-2 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm pointer-events-none shadow-2xl min-w-[180px]">
            <p className="font-bold text-slate-50 mb-2 text-base">{hovered.name}</p>
            <p className="text-slate-300 mb-1">
              Risk:{" "}
              <span className="font-semibold" style={{ color: RISK_COLOR[hovered.risk_level] }}>
                {hovered.risk_score} ({hovered.risk_level})
              </span>
            </p>
            <p className="text-slate-300 mb-1">
              Threats: <span className="font-semibold text-slate-100">{hovered.total_threats.toLocaleString()}</span>
            </p>
            <p className="text-slate-300">
              Primary attack: <span className="font-semibold text-slate-100">{hovered.primary_attack}</span>
            </p>
            <p className="text-slate-500 text-xs mt-2">Click for details</p>
          </div>
        )}
      </div>

      <CountryDetailPanel
        countryCode={selectedCode}
        onClose={() => setSelectedCode(null)}
      />
    </div>
  );
}