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
 * the rate/methodology aesthetic. Active tab gets a 2px bottom border in
 * --text-primary; inactive tabs sit in --text-secondary and lift to
 * --text-primary on hover/focus.
 *
 * Mobile: overflow-x-auto, no scrollbar, no wrap. Items are spaced via
 * gap-6, never breaking onto two lines.
 */
export function SourceTabs({ items, activeId, onSelect, ariaLabel }: Props) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-6 overflow-x-auto scrollbar-none flex-nowrap mb-12 md:mb-16"
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
              "whitespace-nowrap pb-1 border-b-2 transition-colors",
              "focus-visible:outline-none focus-visible:text-[var(--text-primary)]",
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
  );
}
