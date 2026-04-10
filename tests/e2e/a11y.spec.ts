import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LOCALES = ["en", "es", "de", "fr"] as const;

for (const locale of LOCALES) {
  test(`${locale}: no serious or critical a11y violations`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    // Wait for the deferred FadeInOnScroll content to settle so axe scans
    // the actual rendered state, not the pre-animation initial state.
    await page.waitForTimeout(800);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    if (blocking.length > 0) {
      console.log(JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });
}
