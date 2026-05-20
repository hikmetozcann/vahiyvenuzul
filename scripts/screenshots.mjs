import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "/tmp/vahiyvenuzul-shots";
mkdirSync(OUT, { recursive: true });

const targets = [
  { name: "01-home-tr", url: "/tr", viewport: { width: 390, height: 844 } },
  { name: "02-timeline-tr", url: "/tr/timeline", viewport: { width: 390, height: 844 } },
  { name: "03-event-first-revelation-tr", url: "/tr/event/first-revelation", viewport: { width: 390, height: 844 } },
  { name: "04-sources-tr", url: "/tr/sources", viewport: { width: 390, height: 844 } },
  { name: "05-admin-tr", url: "/tr/admin", viewport: { width: 390, height: 844 } },
  { name: "06-home-ar-rtl", url: "/ar", viewport: { width: 390, height: 844 } },
  { name: "07-timeline-ar-rtl", url: "/ar/timeline", viewport: { width: 390, height: 844 } },
  { name: "08-timeline-en-desktop", url: "/en/timeline", viewport: { width: 1280, height: 800 } },
  { name: "09-event-desktop", url: "/tr/event/first-revelation", viewport: { width: 1280, height: 900 } },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
try {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: t.viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(BASE + t.url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    const file = path.join(OUT, `${t.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`✓ ${t.name} → ${file}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
