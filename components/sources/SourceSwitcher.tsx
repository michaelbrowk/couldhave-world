"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SourceHero } from "@/components/sources/SourceHero";
import { SourceCategories } from "@/components/sources/SourceCategories";
import { SourceTabs, type SourceTabItem } from "@/components/sources/SourceTabs";
import { SOURCES } from "@/data/sources.index";
import type { SourceId } from "@/data/sources.schema";
import { parseSourceId } from "@/lib/sources";
import type { SupportedLocale } from "@/lib/formatters";
import { track } from "@/lib/mixpanel";

type DictionarySourceBlock = {
  label: string;
  caption: string;
  rate: string;
  methodology: string;
};
type DictionaryCategoryBlock = {
  label: string;
  [shortKey: string]: { title: string; unit: string; compareUnit?: string } | string;
};

export type SourceSwitcherProps = {
  locale: SupportedLocale;
  ariaTabsLabel: string;
  transitionHeadline: string;
  sourcesDict: Record<SourceId, DictionarySourceBlock>;
  categoriesDict: Record<SourceId, DictionaryCategoryBlock>;
  sourcesToggle: string;
  /** Plain mapping: sourceId → categoryId → short dict key. Serializable. */
  categoryDictKeys: Record<string, Record<string, string>>;
};

/**
 * Pure presentational view: receives the active source as a prop and renders
 * tabs + hero + categories. Used both as the static SSG fallback (with
 * activeId="ai") and as the body of the URL-driven SourceSwitcher.
 *
 * `via` distinguishes whether the active source was decided by the URL
 * (deep-link) or by a user click.
 */
export function SourceSwitcherView({
  activeId,
  locale,
  ariaTabsLabel,
  transitionHeadline,
  sourcesDict,
  categoriesDict,
  sourcesToggle,
  categoryDictKeys,
}: SourceSwitcherProps & { activeId: SourceId }) {
  const router = useRouter();
  const source = SOURCES[activeId];

  const items: readonly SourceTabItem[] = (Object.keys(SOURCES) as SourceId[]).map((id) => ({
    id,
    label: sourcesDict[id].label,
  }));

  const onSelect = (id: SourceId) => {
    if (id === activeId) return;
    track("source_switch", { from: activeId, to: id, locale, via: "click" });
    const next = id === "ai" ? "" : `?source=${id}`;
    router.replace(`/${locale}${next}`, { scroll: false });
  };

  const heroStrings = {
    caption: sourcesDict[activeId].caption.replace("{year}", String(source.currentYear)),
    rate: sourcesDict[activeId].rate,
    methodology: sourcesDict[activeId].methodology
      .replace("{year}", String(source.currentYear))
      .replace("{basedOnYear}", String(source.projection.basedOnYear)),
  };

  const dictBlock = categoriesDict[activeId];
  const sourceLabel = (dictBlock.label as string).replace("{year}", String(source.currentYear));
  const categoriesEntries: Record<string, { title: string; unit: string; compareUnit?: string }> =
    {};
  for (const [k, v] of Object.entries(dictBlock)) {
    if (k === "label") continue;
    categoriesEntries[k] = v as { title: string; unit: string; compareUnit?: string };
  }

  return (
    <div data-source={activeId}>
      <SourceTabs items={items} activeId={activeId} onSelect={onSelect} ariaLabel={ariaTabsLabel} />
      <SourceHero source={source} locale={locale} strings={heroStrings} />
      <SourceCategories
        source={source}
        locale={locale}
        strings={{
          headline: transitionHeadline,
          sourceLabel,
          sourcesToggle,
          categories: categoriesEntries,
          shortKeyFor: (catId) => categoryDictKeys[activeId]?.[catId] ?? catId,
        }}
      />
    </div>
  );
}

/**
 * URL-aware wrapper. Reads `?source=` from the URL via `useSearchParams`
 * (which suspends during static export) and delegates rendering to
 * SourceSwitcherView. Fires the one-shot `source_switch` deep-link event
 * for non-default arrivals.
 *
 * Render this inside <Suspense fallback={<SourceSwitcherView activeId="ai" .../>}>
 * so the static HTML carries the default-state markup, eliminating the
 * post-hydration layout shift.
 */
export function SourceSwitcher(props: SourceSwitcherProps) {
  const params = useSearchParams();
  const activeId: SourceId = parseSourceId(params.get("source")) ?? "ai";

  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (params.get("source") && activeId !== "ai") {
      track("source_switch", { from: null, to: activeId, locale: props.locale, via: "url" });
    }
  }, [activeId, params, props.locale]);

  return <SourceSwitcherView {...props} activeId={activeId} />;
}
