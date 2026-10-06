/**
 * Captures d'inspection à des angles précis (dev).
 * Usage : node scripts/views.mjs <url> <outDir> name:px,py,pz:tx,ty,tz[:keys] ...
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, out, ...views] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: Number(process.env.W ?? 1100), height: Number(process.env.H ?? 800) } })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()))
await page.goto(url, { waitUntil: 'load' })
await page.waitForFunction(() => window.__atelier?.setView && !document.querySelector('[role="status"][aria-busy="true"]'), null, { timeout: 120000 })
await page.waitForTimeout(3000)
for (const v of views) {
  const [name, p, t, keys, ...rest] = v.split(':')
  const js = rest.join(':')
  if (js) {
    await page.evaluate(js)
    await page.waitForTimeout(Number(process.env.KEYWAIT ?? 4000))
  }
  for (const k of keys ? (keys.includes(',') ? keys.split(',') : keys.split('')) : []) await page.keyboard.press(k)
  if (keys) await page.waitForTimeout(Number(process.env.KEYWAIT ?? 4000))
  if (p !== '-') {
    await page.evaluate(([p, t]) => window.__atelier.setView(p.split(',').map(Number), t.split(',').map(Number)), [p, t])
    await page.waitForTimeout(2500)
  }
  await page.screenshot({ path: `${out}/${name}.png`, timeout: 180000 })
  console.log('saved', name)
}
await browser.close()
