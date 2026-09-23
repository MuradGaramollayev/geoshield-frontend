import type { ReactNode } from "react";
import { useReveal, revealStyle } from "./reveal";

/**
 * One landing section: an eyebrow, a heading, optional lead paragraph, and the
 * content, all revealed together as the section scrolls into view.
 */
export default function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  align = "center",
  tone = "plain",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  tone?: "plain" | "sunken";
}) {
  const { ref, shown } = useReveal<HTMLElement>();
  const centred = align === "center";

  return (
    <section
      id={id}
      ref={ref}
      className={`px-6 py-20 sm:py-28 ${tone === "sunken" ? "bg-sunken" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || lead) && (
          <header
            className={`mb-12 sm:mb-16 ${centred ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}`}
            style={revealStyle(shown)}
          >
            {eyebrow && (
              <p className="code text-2xs uppercase tracking-[0.18em] text-accent-ink mb-3">{eyebrow}</p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink text-balance">
                {title}
              </h2>
            )}
            {lead && <p className="mt-4 text-lg text-text-2 leading-relaxed">{lead}</p>}
          </header>
        )}
        <div style={revealStyle(shown, 1)}>{children}</div>
      </div>
    </section>
  );
}
