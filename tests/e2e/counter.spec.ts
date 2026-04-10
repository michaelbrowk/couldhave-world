import { expect, test } from "@playwright/test";

test("counter value increases over time", async ({ page }) => {
  await page.goto("/en/");
  const counter = page.getByRole("status").first();
  await expect(counter).toBeVisible();

  const first = await counter.textContent();
  // 1.5 seconds is enough time for the 100ms ticker to advance the rendered
  // integer dollar value (~$10k per tick × 15 ticks = $150k difference).
  await page.waitForTimeout(1500);
  const second = await counter.textContent();

  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  expect(first).not.toBe(second);
});

test("counter is static when prefers-reduced-motion is set", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/en/");

  const counter = page.getByRole("status").first();
  const first = await counter.textContent();
  await page.waitForTimeout(1500);
  const second = await counter.textContent();

  expect(first).toBe(second);
  await ctx.close();
});
