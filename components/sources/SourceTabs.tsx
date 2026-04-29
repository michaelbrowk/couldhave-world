"use client";

import type { SourceId } from "@/data/sources.schema";

export type SourceTabItem = { id: SourceId; label: string };

type Props = {
  items: readonly SourceTabItem[];
  activeId: SourceId;
  onSelect: (id: SourceId) => void;
  ariaLabel: string;
};

/**
 * Horizontally arranged tabs. Mono, uppercase, tracking-[0.18em] to match
 * the rate/methodology aesthetic. The strip carries a 1px bottom rule in
 * --border-color (echoing CategoryRow dividers further down the page);
 * the active tab's 2px underline punctures that rule via -mb-px, creating
 * a single coherent navigation level rather than two stacked lines.
 *
 * Inactive tabs sit in --text-secondary and lift to --text-primary on
 * hover/focus. On viewports below `md` the strip masks its edges so
 * overflowing items fade out — a quiet affordance for horizontal scroll.
 */
export function SourceTabs({ items, activeId, onSelect, ariaLabel }: Props) {
  return (
    <nav
      aria-label={ariaLabel}
      className="border-b border-[var(--border-color)] mb-12 md:mb-16"
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-none flex-nowrap mask-fade-x md:[mask-image:none]"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="source-tabpanel"
              id={`source-tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              data-mp-event="source_switch"
              data-mp-source={item.id}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const idx = items.findIndex((i) => i.id === activeId);
                  const delta = e.key === "ArrowRight" ? 1 : -1;
                  const next = items[(idx + delta + items.length) % items.length];
                  if (next) onSelect(next.id);
                }
              }}
              className={[
                "font-mono text-xs md:text-sm uppercase tracking-[0.18em]",
                "whitespace-nowrap py-3 border-b-2 -mb-px",
                "transition-[color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "active:scale-[0.97]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]/30 focus-visible:rounded-sm",
                isActive
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
