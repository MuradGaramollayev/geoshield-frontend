"""Regenerates the standalone GeoShield mark files.

    python scripts/make-brand-svgs.py

Keep this geometry in step with src/components/brand/Logo.tsx: the component
is what the app renders, these files are for everything else (favicon, decks,
print, partners).
"""
import io
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "brand"
OUT.mkdir(parents=True, exist_ok=True)

SHIELD = "M24 3.2 L43 10.6 L40.8 27.4 L24 44.8 L7.2 27.4 L5 10.6 Z"
CX, CY, R = 24, 21.5, 10.2
NX, NY = 31.4, 15.2
ACCENT = "#FC582A"


def mark(color: str, bold: bool = False, bg: str | None = None) -> str:
    stroke = 3.4 if bold else 2.2
    grid = 2.2 if bold else 1.5
    node_w = 2.6 if bold else 1.9
    ring_r = 4.0 if bold else 3.3
    dot_r = 1.5 if bold else 1.25
    eq_ry = 3.9 if bold else 3.5
    mer_rx = 4.4 if bold else 4.1
    grid_op = 0.75 if bold else 0.62

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" role="img" aria-label="GeoShield">',
        "<title>GeoShield</title>",
    ]
    if bg:
        parts.append(f'<rect width="48" height="48" rx="11" fill="{bg}"/>')
    parts.append(
        f'<path d="{SHIELD}" stroke="{color}" stroke-width="{stroke}" stroke-linejoin="miter" stroke-miterlimit="8"/>'
    )
    if not bold:
        parts.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" stroke="{color}" stroke-width="{grid}" opacity="0.3"/>')
    if not bold:
        parts += [
            f'<ellipse cx="{CX}" cy="{CY}" rx="{R}" ry="{eq_ry}" stroke="{color}" stroke-width="{grid}" opacity="{grid_op}"/>',
            f'<ellipse cx="{CX}" cy="{CY}" rx="{mer_rx}" ry="{R}" stroke="{color}" stroke-width="{grid}" opacity="{grid_op}"/>',
        ]
    if bold:
        # 16px icon: shield + one equator + the node, no connector line
        parts.append(f'<ellipse cx="{CX}" cy="{CY + 1}" rx="9.4" ry="3.4" stroke="{color}" stroke-width="{grid}" opacity="0.8"/>')
        parts += [
            f'<circle cx="{CX + 4.6}" cy="{CY - 4.6}" r="5.4" stroke="{color}" stroke-width="3.2"/>',
            f'<circle cx="{CX + 4.6}" cy="{CY - 4.6}" r="2" fill="{color}"/>',
            "</svg>",
        ]
    else:
        # the leader stops short of the ring so the pair reads as a plotted point
        parts += [
            f'<path d="M{CX} {CY} L28.3 17.9" stroke="{color}" stroke-width="1.9" stroke-linecap="round"/>',
            f'<circle cx="{NX}" cy="{NY}" r="3.3" stroke="{color}" stroke-width="1.9"/>',
            f'<circle cx="{NX}" cy="{NY}" r="1.25" fill="{color}"/>',
            "</svg>",
        ]
    return chr(10).join(parts) + chr(10)


files = {
    "geoshield-mark.svg": mark(ACCENT),
    "geoshield-mark-white.svg": mark("#FFFFFF"),
    "geoshield-mark-black.svg": mark("#000000"),
    "geoshield-mark-icon.svg": mark(ACCENT, bold=True),
}
for name, svg in files.items():
    io.open(OUT / name, "w", encoding="utf-8", newline="\n").write(svg)
    print("wrote", name)

# favicon: bold mark on the ink tile, so it holds up on light and dark tabs
fav = mark("#FC582A", bold=True, bg="#1C1C1C")
io.open(OUT.parent / "favicon.svg", "w", encoding="utf-8", newline="\n").write(fav)
print("wrote favicon.svg")
