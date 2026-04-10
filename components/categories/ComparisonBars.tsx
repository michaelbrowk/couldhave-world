"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type Props = {
  /** Label above the larger (military) bar. */
  militaryLabel: string;
  /** Pre-formatted military amount for display, e.g. "$3.18T". */
  militaryDisplay: string;
  /** Numeric military amount in USD. */
  militaryAmount: number;
  /** Label above the smaller (alternative) bar. */
  alternativeLabel: string;
  /** Pre-formatted alternative amount, e.g. "$60K". */
  alternativeDisplay: string;
  /** Numeric alternative amount in USD. */
  alternativeAmount: number;
};

const MIN_BAR_PCT = 0.4; // px-equivalent floor so even tiny ratios remain visible

export function ComparisonBars(props: Props) {
  const {
    militaryLabel,
    militaryDisplay,
    militaryAmount,
    alternativeLabel,
    alternativeDisplay,
    alternativeAmount,
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  const max = Math.max(militaryAmount, alternativeAmount);
  const militaryPct = (militaryAmount / max) * 100;
  const altPctRaw = (alternativeAmount / max) * 100;
  const altPct = Math.max(altPctRaw, MIN_BAR_PCT);

  return (
    <div ref={ref} className="w-full max-w-4xl space-y-8">
      <Bar
        label={militaryLabel}
        valueText={militaryDisplay}
        targetWidth={`${militaryPct}%`}
        color="var(--accent)"
        inView={inView}
        reduceMotion={reduceMotion ?? false}
        delay={0}
      />
      <Bar
        label={alternativeLabel}
        valueText={alternativeDisplay}
        targetWidth={`${altPct}%`}
        color="var(--text-primary)"
        inView={inView}
        reduceMotion={reduceMotion ?? false}
        delay={0.4}
      />
    </div>
  );
}

type BarProps = {
  label: string;
  valueText: string;
  targetWidth: string;
  color: string;
  inView: boolean;
  reduceMotion: boolean;
  delay: number;
};

function Bar({ label, valueText, targetWidth, color, inView, reduceMotion, delay }: BarProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2 font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="text-[var(--text-primary)] text-base font-sans normal-case tracking-normal tabular-nums">
          {valueText}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: reduceMotion ? targetWidth : 0 }}
          animate={{ width: reduceMotion || inView ? targetWidth : 0 }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
