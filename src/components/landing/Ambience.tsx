import { useTheme } from "../../design/themeContext";

/**
 * The field the landing page sits on: two very soft pools of light, fixed to
 * the viewport so the content scrolls across them. Being fixed, the browser
 * composites it once — there is no scroll handler and nothing repaints.
 */
export default function Ambience() {
  const th = useTheme();
  const dark = th.theme === "dark";

  // Dark has contrast headroom, so it gets pools of coloured light. Light does
  // not: any coloured wash there darkens the surface and costs the small grey
  // text its contrast, so light is lit with white instead, which only helps.
  const pools = dark
    ? [
        `radial-gradient(70% 55% at 88% 6%, color-mix(in srgb, ${th.c.accent} 10%, transparent), transparent 70%)`,
        `radial-gradient(60% 45% at 6% 62%, color-mix(in srgb, ${th.c.info} 8%, transparent), transparent 72%)`,
      ]
    : [
        `radial-gradient(70% 55% at 88% 6%, ${th.c.paper} 0%, transparent 68%)`,
        `radial-gradient(60% 48% at 4% 58%, ${th.c.paper} 0%, transparent 70%)`,
      ];

  return (
    <div
      aria-hidden
      className="ambience"
      style={{
        background: [
          ...pools,
          // a long tonal drift down the page, within the tones the sections
          // already use, so nothing new is introduced behind the text
          `linear-gradient(180deg, ${th.c.surface} 0%, ${th.c.sunken} 46%, ${th.c.surface} 100%)`,
        ].join(", "),
      }}
    />
  );
}
