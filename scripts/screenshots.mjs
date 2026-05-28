import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "/tmp/vahiyvenuzul-shots";
mkdirSync(OUT, { recursive: true });

const targets = [
  { name: "01-timeline-tr-desktop", url: "/tr/timeline/", viewport: { width: 1280, height: 800 } },
  { name: "02-cinema-scene-1-hira", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "cinema", step: 0 },
  { name: "03-cinema-scene-2-fatrat", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "cinema", step: 1 },
  { name: "04-cinema-scene-3-muddaththir", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "cinema", step: 2 },
  { name: "05-cinema-scene-4-hijra", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "cinema", step: 3 },
  { name: "06-cinema-mobile-hira", url: "/tr/timeline/", viewport: { width: 390, height: 844 }, action: "cinema", step: 0 },
  { name: "07-cinema-mobile-hijra", url: "/tr/timeline/", viewport: { width: 390, height: 844 }, action: "cinema", step: 3 },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
try {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: t.viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(BASE + t.url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(800);

    if (t.action === "cinema") {
      // Launch cinema mode, then step to the requested scene.
      // Scope all subsequent selectors to the cinema dialog so we don't
      // hit the timeline player's identically-named buttons.
      const btn = await page.$('button[aria-label="Sinema modu"]');
      if (btn) {
        await btn.click({ force: true });
        await page.waitForTimeout(900);
        const dialog = await page.$('[role="dialog"][aria-label="Sinema modu"]');
        if (dialog) {
          // Pause first so dwell timer doesn't auto-advance while we step
          const pause = await dialog.$('button[aria-label="Duraklat"]');
          if (pause) await pause.click({ force: true });
          await page.waitForTimeout(300);
          for (let i = 0; i < (t.step ?? 0); i++) {
            const next = await dialog.$('button[aria-label="Sonraki"]');
            if (next) {
              await next.click({ force: true });
              await page.waitForTimeout(500);
            }
          }
          await page.waitForTimeout(1400);
        }
      }
    } else if (t.action === "openDetail") {
      // Click first event node on the timeline (force past Playwright auto-wait)
      const nodes = await page.$$('svg [role="button"]');
      if (nodes.length > 0) {
        await nodes[Math.floor(nodes.length / 2)].click({ force: true });
        await page.waitForTimeout(900);
      }
    } else if (t.action === "zoomIn") {
      // Simulate wheel zoom in the canvas center
      const svg = await page.$("svg");
      if (svg) {
        const box = await svg.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          for (let i = 0; i < 6; i++) {
            await page.mouse.wheel(0, -200);
            await page.waitForTimeout(80);
          }
        }
      }
      await page.waitForTimeout(900);
    } else if (t.action === "play") {
      const playBtn = await page.$('button[aria-label="Oynat"]');
      if (playBtn) {
        await playBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    const file = path.join(OUT, `${t.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`✓ ${t.name} → ${file}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
