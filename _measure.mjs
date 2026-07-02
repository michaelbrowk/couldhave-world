import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const w of [1440, 1920, 2560]) {
  for (const src of ['war','fossil-fuels','ai']) {
    const ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:3100/en/?source=${src}`);
    await p.locator('[role=status]').first().waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    const m = await p.evaluate(() => {
      const el = document.querySelector('[role=status]'); const col = el.parentElement;
      return { font: getComputedStyle(el).fontSize, scrollW: el.scrollWidth, colW: col.clientWidth, over: el.scrollWidth - col.clientWidth, chars: el.textContent.length };
    });
    console.log(`${w}`.padEnd(6), src.padEnd(13), `font=${m.font}`.padEnd(12), `scrollW=${m.scrollW}`.padEnd(14), `colW=${m.colW}`.padEnd(11), `over=${m.over}`, `chars=${m.chars}`);
    await ctx.close();
  }
}
await b.close();
