"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { formatCurrency, type SupportedLocale } from "@/lib/formatters";
import { currentSpendEstimate, type Projection } from "@/lib/projection";

type Props = {
  projection: Projection;
  currentYear: number;
  locale: SupportedLocale;
};

export function TickingCounter({ projection, currentYear, locale }: Props) {
  const reduceMotion = useReducedMotion();
  // Compute once on mount (the component re-mounts per tab via the section
  // key). Recomputing every render would let any re-render advance the value,
  // which must stay frozen under prefers-reduced-motion.
  const [initial] = useState(() => currentSpendEstimate(projection, new Date(), currentYear));

  // Target updates 10×/sec from a wall-clock probe; the spring smooths the
  // jump so the rendered integer dollar value flows at native frame rate
  // (~60fps) instead of stepping every 100ms.
  const target = useMotionValue(initial);
  const smoothed = useSpring(target, {
    damping: 28,
    stiffness: 140,
    mass: 0.4,
  });

  const [displayed, setDisplayed] = useState<number>(initial);
  useMotionValueEvent(smoothed, "change", (v) => {
    setDisplayed(v);
  });

  useEffect(() => {
    if (reduceMotion) return;
    const tick = () => {
      target.set(currentSpendEstimate(projection, new Date(), currentYear));
    };
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [projection, currentYear, reduceMotion, target]);

  const formatted = formatCurrency(reduceMotion ? initial : displayed, locale);

  // Size the figure to its COLUMN, not the viewport. The content column is a
  // fixed ~1056px above the md breakpoint, so a viewport unit (12vw) keeps
  // growing on wide screens and the longest 18-digit figures spill past the
  // column. A container-query unit tracks the column instead: the wrapper is a
  // size container and 15.5cqw renders an 18–19 digit string with margin at
  // any column width — so it never overflows and still scales down on mobile.
  // No JS measurement (which raced the webfont load), no layout shift.
  return (
    <div style={{ containerType: "inline-size" }}>
      <div
        className="font-serif text-[var(--accent)] leading-none tabular-nums tracking-tight"
        style={{ fontSize: locale === "es" ? "min(220px, 14cqw)" : "min(220px, 15.5cqw)" }}
        role="status"
        aria-live="off"
        aria-label={formatted}
        // The server renders one value (server time), the client a slightly
        // larger value (client time, ~ms later). Suppress the hydration warning
        // so React accepts the client value without aborting hydration.
        suppressHydrationWarning
      >
        {formatted}
      </div>
    </div>
  );
}
