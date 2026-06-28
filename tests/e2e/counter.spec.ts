import { expect, test } from "@playwright/test";

const MOBILE_SOURCES = ["war", "fossil-fuels"] as const;

for (const source of MOBILE_SOURCES) {
  test(`counter does not overflow at 375px viewport (source=${source})`, async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await ctx.newPage();
    await page.goto(`/en/?source=${source}`);

    const counter = page.getByRole("status").first();
    await expect(counter).toBeVisible();

    // Assert counter right edge does not exceed viewport width and scrollWidth
    // does not exceed clientWidth of the wrapping <main> container.
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('[role="status"]') as HTMLElement | null;
      if (!el) return { error: "counter not found" };
      const main = document.querySelector("main") as HTMLElement | null;
      const containerWidth = main ? main.clientWidth : window.innerWidth;
      const rect = el.getBoundingClientRect();
      return {
        counterRight: rect.right,
        viewportWidth: window.innerWidth,
        containerWidth,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflowsViewport: rect.right > window.innerWidth,
        overflowsContainer: el.scrollWidth > containerWidth,
      };
    });

    expect(overflow).not.toHaveProperty("error");
    expect((overflow as { overflowsViewport: boolean }).overflowsViewport).toBe(false);
    expect((overflow as { overflowsContainer: boolean }).overflowsContainer).toBe(false);

    await ctx.close();
  });
}

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
