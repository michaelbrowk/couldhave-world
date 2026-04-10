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
  const initial = currentSpendEstimate(projection, new Date(), currentYear);

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
  const yearTotalLabel = formatCurrency(projection.totalUsd, locale);

  // The server renders one value (server time), the client a slightly larger
  // value (client time, ~ms later). Suppress the hydration warning so React
  // accepts the client value without aborting hydration of this subtree.
  return (
    <div
      className="font-serif text-[var(--accent)] leading-none tabular-nums tracking-tight"
      style={{ fontSize: "clamp(56px, 12vw, 220px)" }}
      role="status"
      aria-live="off"
      aria-label={yearTotalLabel}
      suppressHydrationWarning
    >
      {formatted}
    </div>
  );
}
