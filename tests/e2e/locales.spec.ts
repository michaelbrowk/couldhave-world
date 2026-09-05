import { expect, test } from "@playwright/test";
import de from "../../messages/de.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";

/**
 * Per-locale translation of the AI source's first ledger item ("dotcom
 * telecom buildout"). The default source tab is AI, so this is the first
 * category visible on every locale's landing page.
 *
 * Previously this test checked the war-source cancer category. When the
 * default tab changed to AI (feature/data-correction-and-new-tabs), the
 * test was updated accordingly.
 */
const cases = Object.entries({ en, es, de, fr }).map(([code, dict]) => ({
  code,
  firstCategoryTitle: dict.categories.ai.dotcom.title,
}));

for (const { code, firstCategoryTitle } of cases) {
  test(`${code}: hero counter and first category render`, async ({ page }) => {
    await page.goto(`/${code}/`);
    await expect(page).toHaveURL(new RegExp(`/${code}/?$`));

    // Hero counter is exposed as role="status".
    const counter = page.getByRole("status").first();
    await expect(counter).toBeVisible();
    const counterText = await counter.textContent();
    expect(counterText).toMatch(/\$|\d/); // contains a dollar sign or digits

    // The first AI-source category title appears in the ledger.
    // AI is the default source tab, so this is always visible on load.
    await expect(page.getByText(firstCategoryTitle).first()).toBeVisible();
  });
}
