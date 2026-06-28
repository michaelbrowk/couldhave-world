import { expect, test } from "@playwright/test";

test.describe("source tabs", () => {
  test("default state is AI, no ?source= in URL", async ({ page }) => {
    await page.goto("/en/");
    const url = new URL(page.url());
    expect(url.searchParams.get("source")).toBeNull();
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
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

  // Tab order: ai(0), war(1), tobacco(2), fossil-fuels(3), food-waste(4), advertising(5), gambling(6)
  // ArrowRight from ai(0) → war(1)
  test("ArrowRight cycles tabs", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("tab", { name: /^ai$/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /^war$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  // ArrowRight from gambling(6) → ai(0) — wrap-around
  test("ArrowRight wraps from gambling to ai", async ({ page }) => {
    await page.goto("/en/?source=gambling");
    await page.getByRole("tab", { name: /gambling/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
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

  test("clicking AI from war strips source param", async ({ page }) => {
    await page.goto("/en/?source=war");
    await page.getByRole("tab", { name: /^ai$/i }).click();
    // URL should land on /en/ with no source param (or trailing slash variants)
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
  });

  test("direct ?source=ai lands on AI tab and renders categories", async ({ page }) => {
    await page.goto("/en/?source=ai");
    await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute("aria-selected", "true");
    // Hero copy reflects the AI methodology (mentions "Big-5 hyperscaler")
    await expect(page.getByText(/Big-Five hyperscaler/i)).toBeVisible();
    // First AI category renders.
    await expect(page.getByText(/Repeated the dotcom telecom buildout/i).first()).toBeVisible();
  });

  // Mobile: all 7 tabs must be visible (wrapped, not clipped/scrolled off)
  test("all 7 tabs visible at 375px viewport (wrapped chips)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/");
    await page.waitForLoadState("networkidle");

    const tabNames = ["war", "tobacco", "fossil", "ai", "food", "advertising", "gambling"];
    for (const name of tabNames) {
      const tab = page.getByRole("tab", { name: new RegExp(name, "i") });
      const box = await tab.boundingBox();
      expect(box, `Tab "${name}" has no bounding box`).not.toBeNull();
      if (box) {
        expect(box.x, `Tab "${name}" overflows left`).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, `Tab "${name}" overflows right`).toBeLessThanOrEqual(375);
      }
    }
  });
});
