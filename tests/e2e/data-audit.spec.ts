import { expect, test } from "@playwright/test";
import { SOURCES } from "../../data/sources.index";

for (const locale of ["en", "es", "de", "fr"]) {
  test(`${locale}: all seven sources render audited data without overflow or runtime errors`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Keep QA out of production analytics.
    await page.route("**/*mixpanel.com/**", (route) => route.abort());
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [id, source] of Object.entries(SOURCES)) {
      await page.goto(`/${locale}/?source=${id}`);
      await expect(page.locator("[data-source]")).toHaveAttribute("data-source", id);
      await expect(page.locator("details[data-category-id]")).toHaveCount(source.categories.length);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("2026");
      const details = page.locator("#source-tabpanel details");
      await details.locator("summary").click();
      await expect(details.locator("a")).toHaveAttribute("href", source.sourceUrl);
      await expect(details.locator("time")).toHaveAttribute("datetime", source.lastUpdated);
      for (const row of await page.locator("details[data-category-id]").all()) {
        const unit = row.locator(":scope > summary > span:last-child > span:last-child");
        await expect(unit).toBeVisible();
        expect((await unit.textContent())?.trim()).toBeTruthy();
      }
      const widths = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(widths.content, `${locale}/${id} horizontal overflow`).toBeLessThanOrEqual(
        widths.viewport,
      );
    }
    expect(errors).toEqual([]);
  });
}

test("year rollover freezes the reviewed baseline and visibly explains why", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-01-02T12:00:00Z"));
  await page.goto("/en/");
  await expect(page.getByText("The 2026 estimate is complete.", { exact: false })).toBeVisible();
  await expect(page.getByRole("status").first()).toHaveText("$770,000,000,000");
});

test("a selected source survives a locale switch", async ({ page }) => {
  await page.goto("/en/?source=gambling");
  await page.getByRole("link", { name: "DE", exact: true }).click();
  await expect(page).toHaveURL(/\/de\/\?source=gambling$/);
  await expect(page.locator("[data-source]")).toHaveAttribute("data-source", "gambling");
});
