"use client";

import { useEffect, useRef } from "react";
import type { SourceId } from "@/data/sources.schema";

export type SourceTabItem = { id: SourceId; label: string };

type Props = {
  items: readonly SourceTabItem[];
  activeId: SourceId;
  onSelect: (id: SourceId) => void;
  ariaLabel: string;
};

/**
 * Responsive tab strip with two layouts:
 *
 * Mobile (<md): flex-wrap chip row. Each tab is a rounded-full pill;
 * the active chip uses an inverted fill (--text-primary bg, --bg text).
 * Inactive chips show a bordered outline. No horizontal scroll.
 *
 * Desktop (≥md): single overflow-scrollable row with a bottom border.
 * Active tab carries a 2px underline that punctures the border via
 * -mb-px. Inactive tabs underline is transparent. scrollIntoView keeps
 * a deep-linked late tab in view on load.
 */
export function SourceTabs({ items, activeId, onSelect, ariaLabel }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeId]);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 md:gap-8 md:flex-nowrap md:overflow-x-auto md:scrollbar-none md:border-b md:border-[var(--border-color)] mb-10 md:mb-16"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={isActive ? activeRef : null}
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
              } else if (e.key === "Home") {
                e.preventDefault();
                const first = items[0];
                if (first) onSelect(first.id);
              } else if (e.key === "End") {
                e.preventDefault();
                const last = items[items.length - 1];
                if (last) onSelect(last.id);
              }
            }}
            className={[
              "font-mono text-xs md:text-sm uppercase tracking-[0.18em] whitespace-nowrap",
              "transition-[color,background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "active:scale-[0.97]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]/70 focus-visible:rounded-full md:focus-visible:rounded-none",
              isActive
                ? "rounded-full px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg)] border border-[var(--text-primary)] md:bg-transparent md:text-[var(--text-primary)] md:rounded-none md:px-0 md:py-3 md:border-0 md:border-b-2 md:border-[var(--text-primary)] md:-mb-px"
                : "rounded-full px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] md:border-0 md:border-b-2 md:border-transparent md:rounded-none md:px-0 md:py-3",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
