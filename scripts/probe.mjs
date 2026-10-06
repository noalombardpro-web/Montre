/** Sonde de debug : exécute une expression JS dans la page (dev). Usage : node scripts/probe.mjs <url> "<keys>" "<expr>" */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, keys, expr] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
await page.goto(url, { waitUntil: 'load' })
await page.waitForFunction(() => window.__atelier?.scene && !document.querySelector('[role="status"][aria-busy="true"]'), null, { timeout: 120000 })
for (const k of keys.split('')) await page.keyboard.press(k)
await page.waitForTimeout(3000)
console.log(JSON.stringify(await page.evaluate(expr), null, 1))
await browser.close()
