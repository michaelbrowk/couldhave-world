import { expect, test } from "@playwright/test";

test("language switcher navigates between locales preserving anchor", async ({ page }) => {
  await page.goto("/en/");

  // Footer is at the very bottom, scroll into view first.
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();

  // Switch en → de
  const deLink = page.getByRole("navigation", { name: "Language" }).getByRole("link", {
    name: "DE",
  });
  await deLink.click();
  await expect(page).toHaveURL(/\/de\/?$/);
  // German methodology heading should be present after navigation.
  await expect(page.getByRole("heading", { name: "Methodik" })).toBeVisible();

  // Switch de → fr
  await footer.scrollIntoViewIfNeeded();
  const frLink = page.getByRole("navigation", { name: "Language" }).getByRole("link", {
    name: "FR",
  });
  await frLink.click();
  await expect(page).toHaveURL(/\/fr\/?$/);
  await expect(page.getByRole("heading", { name: "Méthodologie" })).toBeVisible();
});

test("current locale is marked aria-current=page", async ({ page }) => {
  await page.goto("/es/");
  const switcher = page.getByRole("navigation", { name: "Language" });
  const current = switcher.locator("[aria-current='page']");
  await expect(current).toHaveText("ES");
});
