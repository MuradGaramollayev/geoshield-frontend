# GeoShield design system

One token set for the whole product. The Enterprise reference screenshots are the
source of truth for colour, spacing and elevation; the Analyst panel uses the
same tokens with a denser, faster "temperature".

Tokens live in `src/index.css` (`@theme`, so every token is both a CSS variable
and a Tailwind utility) and are mirrored for JavaScript in `src/design/tokens.ts`
(Recharts, MapLibre and SVG can't read CSS variables).

## Colour

Sampled as the median of 7×7 pixel patches from the reference images, not guessed.

| Token | Hex | Sampled from | Role |
|---|---|---|---|
| `canvas` | `#DDDBDC` | Outer frame around the app | L0, behind the app shell |
| `surface` | `#F1F1F1` | Page and card fill (identical in the reference) | L1 background, L2 card fill |
| `sunken` | `#E7E7E7` | Derived | Wells, tracks, table stripes |
| `well` | `#DDDDDD` | "State" bars, duration track | Bar tracks, disabled fills |
| `paper` | `#FFFFFF` | Icon tiles, active segmented tab | L3: tiles, inputs, active controls |
| `ink` / `ink-2` | `#161616` / `#1C1C1C` | Headings, "9 Critical" bar, dark "+" button | Primary text, primary buttons |
| `text-2` | `#5E5E5E` | Nav labels (`#707070`), darkened for AA | Secondary text, 7.0:1 on surface |
| `text-3` | `#767676` | Subtitles (`#828282`), darkened for AA | Meta text, 4.5:1 on surface |
| `text-4` | `#A3A3A3` | Axis ticks (`#A3A3A3`) | Decorative only, never for content |
| `accent` | `#FC582A` | "11 High" bar, donut, IP legend (`#FC582A`/`#FE562D`) | Data highlight, brand mark |
| `accent-300/200/100` | `#F6A48E` `#F3D2C9` `#F6E7DF` | Donut segments 2–4 | Tints, single-hue ramps |
| `positive` on `positive-tint` | `#2E8B6A` on `#D3EEE2` | "Active", "16% Up" badges | Success, falling risk |

Primary actions are **ink**, as in the reference (dark "+" button, dark bars). The
orange accent is kept for data and emphasis so it doesn't compete with severity.

### Severity — the only severity colours in the product

| Level | Solid (chips, bars) | Text on solid | Tint | Text on tint |
|---|---|---|---|---|
| Critical | `#B3122E` | `#FFFFFF` | `#F7DCE0` | `#9E0F28` |
| High | `#FC582A` (reference) | `#1A0A04` | `#FFE3D8` | `#B3380F` |
| Medium | `#EFA532` | `#1F1405` | `#FBEBCF` | `#875806` |
| Low | `#23845F` | `#FFFFFF` | `#D3EEE2` | `#1B6B4D` |

Hue **and** lightness both step between levels, so the scale still reads for
colour-blind users. The Analyst panel renders solid chips (triage by colour);
Enterprise renders tints of the same hues. `SeverityBadge` picks automatically.

Bands match the backend (verified against all 124 countries): Low 0–29,
Medium 30–44, High 45–64, Critical 65+.

The map uses a continuous ramp (`RISK_RAMP`) whose stops pass through each
severity colour in the middle of its band, so a country's colour always agrees
with its badge.

## Type

- **Manrope** (variable, self-hosted via `@fontsource-variable`): all UI text.
  Geometric and round, close to the reference.
- **JetBrains Mono** (variable, self-hosted): IPs, CVE IDs, hashes, ports and
  timestamps, mostly in the Analyst panel.

One scale for everything (px): 11 · 12 · 13 · **14 (base)** · 16 · 20 · 24 · 32 · 44 · 60 · 80.
Every number uses `tabular-nums` (`.num`); technical values use `.code`.

## Elevation

The reference separates layers with a white inner rim and a faint outer hairline,
not with different fills.

| Level | Class | Use |
|---|---|---|
| e1 | `.e1` | Grouping well (app frame, Kanban columns): 3px white inset rim |
| e2 | `.e2` | Cards: 1.5px white rim + hairline + soft directional shadow; lifts on hover |
| e3 | `.e3` | White paper: icon tiles, inputs, active controls, list items |
| e4 | `.e4` | Floating glass: modals, drawers, tooltips, command palette, AI panels |

Glass (backdrop blur) is used **only** at e4.

## Radii and spacing

Radii: 6 · 10 · 14 · 20 · 28. Spacing follows Tailwind's 4px scale; card padding
and grid gaps come from panel tokens (below).

## Panel temperature

Set with `data-panel` on the shell root and read through `useMotion()`:

| | Analyst | Enterprise |
|---|---|---|
| Transition (`--dur`) | 150 ms | 280 ms |
| Card padding | 16 px | 28 px |
| Grid gap | 12 px | 24 px |
| Severity chips | Solid, monospace codes (`CRITICAL`) | Tinted, words ("Critical") |
| Navigation | 68 px icon rail, instant tooltips | 252 px labelled, grouped sidebar |
| Copy | Technical ("IOC Lookup", "Incident Queue") | Business ("Risk exposure", "Board Reports") |

## Motion

- Hover: lift 1–2 px plus a shadow change, at the panel's `--dur`.
- Loading: shimmer skeletons shaped like the real content, never spinners or "Loading…".
- Numbers count up once on load (`CountUp`).
- `prefers-reduced-motion` turns animation off globally.

## Components (`src/components/ui`)

`Card`, `CardHeader`, `IconTile`, `Button`, `IconButton`, `SeverityBadge`,
`Badge`, `TrendBadge`, `Skeleton*`, `EmptyState`, `ErrorState`, `PageHeader`,
`Segmented`, `TextField`, `SearchField`, `SelectField`, `CountUp`, `Sparkline`,
`StatTile`, `SegmentGauge`, `MeterRow`, `KeyValue`, `Modal`, `Drawer`,
`MethodologyNote`, `Table`, `Th`.

Every derived number sits next to a `MethodologyNote` explaining its inputs and formula.
