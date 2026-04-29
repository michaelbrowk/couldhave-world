"use client";

import { useEffect } from "react";
import { initMixpanel, track } from "@/lib/mixpanel";
import { parseSourceId } from "@/lib/sources";

type Props = {
  locale: string;
};

function readActiveSource(target: HTMLElement | null): string {
  const el = target?.closest("[data-source]") as HTMLElement | null;
  return el?.dataset.source ?? "war";
}

export function Analytics({ locale }: Props) {
  useEffect(() => {
    initMixpanel();

    const url = new URL(window.location.href);
    const initialSource = parseSourceId(url.searchParams.get("source")) ?? "war";
    track("page_view", {
      locale,
      path: url.pathname,
      referrer: document.referrer || null,
      initial_source: initialSource,
    });

    const onToggle = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLDetailsElement)) return;
      const id = target.dataset.categoryId;
      if (!id) return;
      track(target.open ? "category_expanded" : "category_collapsed", {
        category_id: id,
        source: readActiveSource(target),
        locale,
      });
    };
    document.addEventListener("toggle", onToggle, true);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const langNav = link.closest('nav[aria-label="Language"]');
      if (langNav) {
        const to = link.textContent?.trim().toLowerCase() ?? null;
        track("language_switched", { from: locale, to });
        return;
      }

      const sourceCategory = link
        .closest("details[data-category-id]")
        ?.getAttribute("data-category-id");
      if (sourceCategory && link.target === "_blank") {
        track("source_clicked", {
          category_id: sourceCategory,
          source_url: link.href,
          source_label: link.textContent?.trim() ?? null,
          source: readActiveSource(target),
          locale,
        });
        return;
      }

      if (link.href.includes("github.com/")) {
        track("github_clicked", { locale, href: link.href });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onClick);
    };
  }, [locale]);

  return null;
}
