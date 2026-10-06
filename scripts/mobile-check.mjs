/** Inspection mobile (dev) : node scripts/mobile-check.mjs <url> <out.png> [waitMs] */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, out, wait = '15000'] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
await page.goto(url, { waitUntil: 'load' })
await page.waitForSelector('.scene-canvas.is-ready', { timeout: 240000 })
await page.waitForTimeout(Number(wait))
console.log(await page.evaluate(() => { const c = document.querySelector('canvas'); return [c.width, c.height, getComputedStyle(c).opacity] }))
await page.screenshot({ path: out, timeout: 240000 })
await browser.close()
