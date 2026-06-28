import { expect, test } from "@playwright/test";

/**
 * Per-locale translation of the AI source's first ledger item ("dotcom
 * telecom buildout"). The default source tab is AI, so this is the first
 * category visible on every locale's landing page.
 *
 * Previously this test checked the war-source cancer category. When the
 * default tab changed to AI (feature/data-correction-and-new-tabs), the
 * test was updated accordingly.
 */
const cases = [
  { code: "en", firstCategoryTitle: "Repeated the dotcom telecom buildout" },
  { code: "es", firstCategoryTitle: "Repetido el despliegue telecom de la burbuja puntocom" },
  { code: "de", firstCategoryTitle: "Dotcom-Telekombuildout wiederholt" },
  { code: "fr", firstCategoryTitle: "Répété le déploiement télécom de la bulle internet" },
] as const;

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
