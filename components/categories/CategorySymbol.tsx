import type { CategorySymbolId } from "@/data/categories.schema";

type Props = {
  symbol: CategorySymbolId;
  size?: number;
  className?: string;
};

/**
 * Abstract single-stroke SVG icons for category matrices. Each glyph is
 * monochrome `currentColor`, drawn on a 24×24 viewBox, and tuned to read
 * cleanly at sizes from 12px to 80px without anti-alias mush. The icons are
 * decorative — the parent `SymbolMatrix` provides an aria-label describing
 * the entire grid, so individual symbols carry `aria-hidden` and no title.
 */
export function CategorySymbol({ symbol, size = 16, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (symbol) {
    case "cross":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>cross</title>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>drop</title>
          <path d="M12 3c3.5 5 6 8 6 11.5a6 6 0 1 1-12 0C6 11 8.5 8 12 3z" />
        </svg>
      );
    case "grain":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>grain</title>
          <path d="M12 3v18" />
          <path d="M12 7c0 1.5-1.5 3-3 3M12 7c0-1.5 1.5-3 3-3" />
          <path d="M12 11c0 1.5-1.5 3-3 3M12 11c0-1.5 1.5-3 3-3" />
          <path d="M12 15c0 1.5-1.5 3-3 3M12 15c0-1.5 1.5-3 3-3" />
        </svg>
      );
    case "roof":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>roof</title>
          <path d="M3 12 12 4l9 8" />
          <path d="M5 11v9h14v-9" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>coin</title>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>leaf</title>
          <path d="M5 19c0-8 6-14 14-15-1 9-7 15-14 15z" />
          <path d="M5 19 14 10" />
        </svg>
      );
    case "ray":
      return (
        <svg {...common} aria-hidden="true" focusable="false">
          <title>ray</title>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M5 19l1.8-1.8M17.2 6.8 19 5" />
        </svg>
      );
  }
}
