"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatCompact, type SupportedLocale } from "@/lib/formatters";
import { currentSpendEstimate, type Projection } from "@/lib/projection";

type Props = {
  /** Live projection — bar fills up as the year progresses. */
  projection: Projection;
  currentYear: number;
  /** Pre-translated label for the larger (military) bar. */
  militaryLabel: string;
  /** Static cost of one alternative unit. */
  alternativeAmount: number;
  /** Pre-translated label for the alternative bar. */
  alternativeLabel: string;
  /** Pre-formatted alternative amount, e.g. "$60K". */
  alternativeDisplay: string;
  locale: SupportedLocale;
};

const MIN_BAR_PCT = 0.4;

export function ComparisonBars(props: Props) {
  const {
    projection,
    currentYear,
    militaryLabel,
    alternativeAmount,
    alternativeLabel,
    alternativeDisplay,
    locale,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  // Live current spend, ticked every 100ms to match the main hero counter.
  const [currentSpend, setCurrentSpend] = useState<number>(() =>
    currentSpendEstimate(projection, new Date(), currentYear),
  );

  useEffect(() => {
    if (reduceMotion) return;
    const tick = () => setCurrentSpend(currentSpendEstimate(projection, new Date(), currentYear));
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [projection, currentYear, reduceMotion]);

  // Both bars share the SAME scale: full annual projection. This makes the
  // military bar a literal year-progress meter (0% → 100% over the year)
  // while the alternative stays fixed as a tiny fraction.
  const fullYear = projection.totalUsd;
  const militaryProgressPct = Math.min(100, (currentSpend / fullYear) * 100);
  const altPct = Math.max((alternativeAmount / fullYear) * 100, MIN_BAR_PCT);

  const militaryDisplay = formatCompact(currentSpend, locale);

  return (
    <div ref={ref} className="w-full max-w-4xl space-y-8">
      <ProgressBar
        label={militaryLabel}
        valueText={militaryDisplay}
        targetPct={militaryProgressPct}
        color="var(--accent)"
        inView={inView}
        reduceMotion={reduceMotion ?? false}
        delay={0}
        live
      />
      <ProgressBar
        label={alternativeLabel}
        valueText={alternativeDisplay}
        targetPct={altPct}
        color="var(--text-primary)"
        inView={inView}
        reduceMotion={reduceMotion ?? false}
        delay={0.4}
        live={false}
      />
    </div>
  );
}

type BarProps = {
  label: string;
  valueText: string;
  targetPct: number;
  color: string;
  inView: boolean;
  reduceMotion: boolean;
  delay: number;
  /** If true, the bar's width updates instantly (no transition) on each tick. */
  live: boolean;
};

function ProgressBar({
  label,
  valueText,
  targetPct,
  color,
  inView,
  reduceMotion,
  delay,
  live,
}: BarProps) {
  // Track whether the entrance animation has finished. Before completion, use
  // a long ease so the bar fills smoothly from 0. After completion, snap
  // updates instantly so the live ticker doesn't lag behind state changes.
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2 font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
        <span>{label}</span>
        <span
          className="text-[var(--text-primary)] text-base font-sans normal-case tracking-normal tabular-nums"
          // Live military value differs between server-render and client-
          // hydration by a few ms; suppressing the diff so React doesn't
          // bail out of hydration for the surrounding subtree.
          suppressHydrationWarning={live}
        >
          {valueText}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: reduceMotion ? `${targetPct}%` : 0 }}
          animate={{ width: reduceMotion || inView ? `${targetPct}%` : 0 }}
          transition={{
            duration: live && hasEntered ? 0 : 1.2,
            delay: hasEntered ? 0 : delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            if (!hasEntered) setHasEntered(true);
          }}
        />
      </div>
    </div>
  );
}
