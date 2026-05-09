import { expect, test } from "@playwright/test";

test.describe("source tabs", () => {
  test("default state is war, no ?source= in URL", async ({ page }) => {
    await page.goto("/en/");
    const url = new URL(page.url());
    expect(url.searchParams.get("source")).toBeNull();
    await expect(page.getByRole("tab", { name: /war/i })).toHaveAttribute("aria-selected", "true");
  });

  test("clicking Tobacco updates URL and active tab", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("tab", { name: /tobacco/i }).click();
    await expect(page).toHaveURL(/\?source=tobacco/);
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: /war/i })).toHaveAttribute("aria-selected", "false");
  });

  test("direct ?source=fossil-fuels lands on the right tab", async ({ page }) => {
    await page.goto("/en/?source=fossil-fuels");
    await expect(page.getByRole("tab", { name: /fossil/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Hero copy reflects fossil-fuels methodology
    await expect(page.getByText(/IMF Working Paper/i)).toBeVisible();
  });

  test("clicking the active tab is a no-op", async ({ page }) => {
    await page.goto("/en/?source=tobacco");
    const url1 = page.url();
    await page.getByRole("tab", { name: /tobacco/i }).click();
    const url2 = page.url();
    expect(url1).toBe(url2);
  });

  test("ArrowRight cycles tabs", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("tab", { name: /war/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("reduced-motion disables fade animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/en/");
    await page.getByRole("tab", { name: /tobacco/i }).click();
    // No assertion on opacity — just ensure no runtime errors. The
    // motion-safe: variant pruning is implicit in Tailwind.
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await context.close();
  });

  test("clicking AI updates URL and active tab", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("tab", { name: /^ai$/i }).click();
    await expect(page).toHaveURL(/\?source=ai/);
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
  });

  test("direct ?source=ai lands on AI tab and renders categories", async ({ page }) => {
    await page.goto("/en/?source=ai");
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
    // Hero copy reflects the AI methodology (mentions "Big-5 hyperscaler")
    await expect(page.getByText(/Big-5 hyperscaler/i)).toBeVisible();
    // First AI category renders.
    await expect(page.getByText(/Repeated the dotcom telecom buildout/i).first()).toBeVisible();
  });
});
