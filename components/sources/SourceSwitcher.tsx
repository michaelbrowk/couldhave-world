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
  label: string; // e.g. "Military spending {year}"
  [shortKey: string]: { title: string; unit: string; compareUnit?: string } | string;
};

type Props = {
  locale: SupportedLocale;
  ariaTabsLabel: string;
  transitionHeadline: string;
  sourcesDict: Record<SourceId, DictionarySourceBlock>;
  categoriesDict: Record<SourceId, DictionaryCategoryBlock>;
  sourcesToggle: string;
  /** Plain mapping: sourceId → categoryId → short dict key. Serializable. */
  categoryDictKeys: Record<string, Record<string, string>>;
};

export function SourceSwitcher({
  locale,
  ariaTabsLabel,
  transitionHeadline,
  sourcesDict,
  categoriesDict,
  sourcesToggle,
  categoryDictKeys,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const activeId: SourceId = parseSourceId(params.get("source")) ?? "war";
  const source = SOURCES[activeId];

  const items: readonly SourceTabItem[] = (Object.keys(SOURCES) as SourceId[]).map((id) => ({
    id,
    label: sourcesDict[id].label,
  }));

  // Fire one-shot URL-arrival event for deep-linked sources (?source=tobacco
  // direct land), excluding the default "war" so we don't double-count
  // page_view's initial_source.
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (params.get("source") && activeId !== "war") {
      track("source_switch", { from: null, to: activeId, locale, via: "url" });
    }
  }, [activeId, locale, params]);

  const onSelect = (id: SourceId) => {
    if (id === activeId) return;
    track("source_switch", { from: activeId, to: id, locale, via: "click" });
    const next = id === "war" ? "" : `?source=${id}`;
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
  // Build a Record<shortKey, entry> excluding the "label" field.
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
