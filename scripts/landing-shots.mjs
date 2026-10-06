/** Captures de la landing à plusieurs positions de scroll. Usage : node scripts/landing-shots.mjs <url> <outDir> [tag] [w] [h] */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, out, tag = 'desktop', w = '1440', h = '900'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const mobile = Number(w) < 600
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
await page.goto(url, { waitUntil: 'load' })
await page.waitForFunction(() => !document.querySelector('[role="status"][aria-busy="true"]'), null, { timeout: 180000 })
await page.waitForTimeout(4000)
for (const p of (process.env.STOPS ?? '0,0.2,0.45,0.58,0.76,1').split(',').map(Number)) {
  await page.evaluate((p) => window.scrollTo(0, p * (document.documentElement.scrollHeight - innerHeight)), p)
  await page.waitForTimeout(Number(process.env.WAIT ?? 6000))
  await page.screenshot({ path: `${out}/landing-${tag}-${String(p).replace('.', '_')}.png`, timeout: 180000 })
  console.log('saved', p)
}
await browser.close()
