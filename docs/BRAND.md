# GeoShield brand mark

## The idea

A faceted, gem-cut shield holds a minimal geo-grid with one located point.

- **Shield** — angular, not rounded: two flat top facets meeting at a shallow
  peak, straight sides tapering to a sharp bottom point. Miter joins keep the
  facets and the point crisp at any size.
- **Geo-grid** — a wide flat ellipse (equator), a narrow tall one (meridian)
  and a faint full circle. Fine linework, never a filled globe.
- **Detection node** — a short leader from the centre out to a ringed dot,
  stopping just short of the ring so the pair reads as a plotted point rather
  than a magnifying glass. This is the signature detail and is only simplified,
  never removed.

Deliberately avoided: padlocks, skulls, circuit traces, binary, map pins,
fingerprints.

## Colour

The mark carries the accent sampled from the product references, `#FC582A`.
In a lockup the wordmark stays monochrome (`ink` on light, white on dark) so
the icon is the only thing carrying colour.

## Files

| File | Use |
|---|---|
| `public/brand/geoshield-mark.svg` | Full colour, the default mark |
| `public/brand/geoshield-mark-white.svg` | Pure white, for dark backgrounds |
| `public/brand/geoshield-mark-black.svg` | Pure black, for print and light backgrounds |
| `public/brand/geoshield-mark-icon.svg` | Bold simplification for 16–32px: shield, one equator, node |
| `public/favicon.svg` | The bold mark on the ink tile |

In the app, use the component rather than the files:
`LogoMark`, `LogoLockup` and `LogoTile` in `src/components/brand/Logo.tsx`.
They share the same geometry and pick up the active theme.

The PDF report draws the same mark as vectors (`_draw_mark` in
`backend/routers/report.py`), on the same 48-unit grid, so print and screen
match without shipping a bitmap.

## Where it appears

Analyst rail (tile), Enterprise sidebar (lockup), auth pages, landing navbar and
footer, the route loading state, the browser tab (favicon), and the PDF report
cover and page headers.

## Regenerating the SVG files

The standalone files are generated from the same geometry as the component. If
the mark changes, update `Logo.tsx` and regenerate so the two cannot drift.
