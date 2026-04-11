"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { memo, useRef } from "react";
import type { CategorySymbolId } from "@/data/categories.schema";
import type { SymbolCountResult } from "@/lib/categories";
import { CategorySymbol } from "./CategorySymbol";

type Props = {
  symbol: CategorySymbolId;
  count: SymbolCountResult;
  /** Pre-built aria-label for the entire matrix, computed server-side. */
  ariaLabel: string;
};

// Unified cell size across discrete and dense matrices so symbols feel
// consistent regardless of count. Visual mass varies by quantity, not by
// per-symbol scale.
const CELL = 18;
const GAP = 6;
const STAGGER = 0.008;

// The parent CategoryRow re-renders at ~10 Hz to tick the headline metric, but
// `count.visibleCount` changes far more slowly (once per minute at most for
// perUnit categories, and even slower for dense-mode ones). Memoize on the
// identity of (symbol, visibleCount, unitsPerSymbol, ariaLabel) so we skip
// 99% of the parent's renders and avoid thrashing the 200+ symbol DOM subtree.
function SymbolMatrixImpl({ symbol, count, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduceMotion = useReducedMotion();

  const cell = CELL;
  const gap = GAP;
  const stagger = STAGGER;

  const items = Array.from({ length: count.visibleCount });

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-start w-full"
      style={{ gap }}
      role="img"
      aria-label={ariaLabel}
      // Parent ticks the metric from live YTD spend. Static export means
      // the HTML was frozen at build time with a slightly different count
      // than the client computes at first render — suppress the warning so
      // React reconciles to the fresher client value without spam.
      suppressHydrationWarning
    >
      {items.map((_, i) => {
        const delay = reduceMotion ? 0 : i * stagger;
        const visible = reduceMotion || inView;
        // Symbols are pure decoration with no identity beyond position; the
        // array length only changes when the underlying category data does
        // (full re-render), so a stable position-based key is correct.
        const key = `${symbol}-${i}`;
        return (
          <motion.span
            key={key}
            className="text-[var(--text-primary)] inline-flex items-center justify-center"
            style={{ width: cell, height: cell }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{
              duration: 0.35,
              delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <CategorySymbol symbol={symbol} size={cell - 4} />
          </motion.span>
        );
      })}
    </div>
  );
}

export const SymbolMatrix = memo(
  SymbolMatrixImpl,
  (prev, next) =>
    prev.symbol === next.symbol &&
    prev.ariaLabel === next.ariaLabel &&
    prev.count.visibleCount === next.count.visibleCount &&
    prev.count.unitsPerSymbol === next.count.unitsPerSymbol &&
    prev.count.mode === next.count.mode,
);
