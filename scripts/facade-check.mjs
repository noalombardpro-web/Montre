/** Vérifie la façade : poster avant interaction, puis 3D alignée après. Usage : node scripts/facade-check.mjs <url> <outDir> [w] [h] */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, out, w = '1440', h = '900'] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const mobile = Number(w) < 600
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, isMobile: mobile, hasTouch: mobile })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/facade-${w}-poster.png` })
await page.mouse.move(200, 200)
await page.waitForFunction(() => document.querySelector('.scene-canvas.is-ready'), null, { timeout: 180000 })
await page.waitForTimeout(9000)
await page.screenshot({ path: `${out}/facade-${w}-3d.png`, timeout: 180000 })
console.log('ok')
await browser.close()
