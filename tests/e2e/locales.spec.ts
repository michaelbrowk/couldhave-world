import { expect, test } from "@playwright/test";

/**
 * Per-locale dictionary key (the human translation of the cancer category
 * title). Picking the cancer category because it's the first one in the
 * ledger and is reliably present at every locale.
 */
const cases = [
  { code: "en", cancerTitle: "Cured cancer worldwide" },
  { code: "es", cancerTitle: "Curado el cáncer en todo el mundo" },
  { code: "de", cancerTitle: "Krebs weltweit geheilt" },
  { code: "fr", cancerTitle: "Guéri du cancer dans le monde" },
] as const;

for (const { code, cancerTitle } of cases) {
  test(`${code}: hero counter and first category render`, async ({ page }) => {
    await page.goto(`/${code}/`);
    await expect(page).toHaveURL(new RegExp(`/${code}/?$`));

    // Hero counter is exposed as role="status".
    const counter = page.getByRole("status").first();
    await expect(counter).toBeVisible();
    const counterText = await counter.textContent();
    expect(counterText).toMatch(/\$|\d/); // contains a dollar sign or digits

    // The cancer category title appears in the ledger.
    await expect(page.getByText(cancerTitle).first()).toBeVisible();
  });
}
