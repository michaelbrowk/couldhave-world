"use client";

import { useEffect } from "react";
import { initMixpanel, track } from "@/lib/mixpanel";

type Props = {
  locale: string;
};

/**
 * Mounts on every locale page, initializes Mixpanel once, fires a single
 * `page_view` event, and installs delegated listeners for category
 * expand/collapse, language switching, source clicks, and outbound clicks
 * to GitHub. Renders no DOM.
 */
export function Analytics({ locale }: Props) {
  useEffect(() => {
    initMixpanel();

    track("page_view", {
      locale,
      path: window.location.pathname,
      referrer: document.referrer || null,
    });

    // Category expand / collapse — delegated via the toggle event on every
    // <details> inside the category ledger. We pull the category id from a
    // data-attribute set in CategoryRow.
    const onToggle = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLDetailsElement)) return;
      const id = target.dataset.categoryId;
      if (!id) return; // ignore the inner "see sources" <details>
      track(target.open ? "category_expanded" : "category_collapsed", {
        category_id: id,
        locale,
      });
    };
    // The toggle event does not bubble in some browsers, so we capture.
    document.addEventListener("toggle", onToggle, true);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      // Language switcher — element lives inside <nav aria-label="Language">.
      const langNav = link.closest('nav[aria-label="Language"]');
      if (langNav) {
        const to = link.textContent?.trim().toLowerCase() ?? null;
        track("language_switched", { from: locale, to });
        return;
      }

      // Source link inside a category's "see sources" panel — these all
      // open in a new tab. We grab the category id from the closest
      // CategoryRow's data-attribute.
      const sourceCategory = link
        .closest("details[data-category-id]")
        ?.getAttribute("data-category-id");
      if (sourceCategory && link.target === "_blank") {
        track("source_clicked", {
          category_id: sourceCategory,
          source_url: link.href,
          source_label: link.textContent?.trim() ?? null,
          locale,
        });
        return;
      }

      // GitHub repo link in the methodology footer.
      if (link.href.includes("github.com/")) {
        track("github_clicked", {
          locale,
          href: link.href,
        });
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
