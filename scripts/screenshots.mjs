import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "/tmp/vahiyvenuzul-shots";
mkdirSync(OUT, { recursive: true });

const targets = [
  { name: "01-home-tr-mobile", url: "/tr/", viewport: { width: 390, height: 844 } },
  { name: "02-timeline-tr-mobile", url: "/tr/timeline/", viewport: { width: 390, height: 900 } },
  { name: "03-timeline-tr-mobile-detail", url: "/tr/timeline/", viewport: { width: 390, height: 900 }, action: "openDetail" },
  { name: "04-timeline-tr-desktop", url: "/tr/timeline/", viewport: { width: 1280, height: 800 } },
  { name: "05-timeline-tr-desktop-zoomed", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "zoomIn" },
  { name: "06-timeline-tr-desktop-detail", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "openDetail" },
  { name: "07-timeline-tr-desktop-playing", url: "/tr/timeline/", viewport: { width: 1280, height: 800 }, action: "play" },
  { name: "08-timeline-ar-rtl-mobile", url: "/ar/timeline/", viewport: { width: 390, height: 900 } },
  { name: "09-timeline-en-desktop", url: "/en/timeline/", viewport: { width: 1280, height: 800 } },
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

    if (t.action === "openDetail") {
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
