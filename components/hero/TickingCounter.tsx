"use client";

import { useReducedMotion } from "framer-motion";
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
  const [value, setValue] = useState<number>(() =>
    currentSpendEstimate(projection, new Date(), currentYear),
  );

  useEffect(() => {
    if (reduceMotion) return;
    // Tick at 10fps (every 100ms), not every animation frame. At 60fps the
    // last 4-5 digits change so fast they read as visual noise. At 10fps
    // each tick advances by ~$10k, which the eye can actually follow.
    const tick = () => {
      setValue(currentSpendEstimate(projection, new Date(), currentYear));
    };
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [projection, currentYear, reduceMotion]);

  const formatted = formatCurrency(value, locale);
  const yearTotalLabel = formatCurrency(projection.totalUsd, locale);

  // The server renders one value (server time), the client a slightly larger
  // value (client time, ~ms later). Suppress the hydration warning so React
  // accepts the client value without aborting hydration of this subtree.
  // Without this, the entire client-side hydration of children below the
  // counter (framer-motion fade-ins, useEffect tickers) silently fails.
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
