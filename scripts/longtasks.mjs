/** Mesure les long tasks (>50 ms) pendant le chargement. Usage : node scripts/longtasks.mjs <url> [seconds] */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url, secs = '20'] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 1350, height: 940 } })
await page.addInitScript(() => {
  window.__lt = []
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true })
  window.__raf = []
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => raf((t) => { const a = performance.now(); cb(t); window.__raf.push(performance.now() - a) })
  const orig = performance.mark.bind(performance)
  window.__marks = []
  performance.mark = (n, o) => (window.__marks.push([n, Math.round(performance.now())]), orig(n, o))
})
await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(Number(secs) * 1000)
const lt = await page.evaluate(() => window.__lt)
const marks = await page.evaluate(() => window.__marks)
console.log('longtasks', lt.length, 'total', lt.reduce((a, b) => a + b[1], 0), 'ms')
console.log(lt.map((x) => x.join('+')).join(' '))
console.log(marks.map((m) => m.join('@')).join(' '))
const r = await page.evaluate(() => { const x = window.__raf.slice(-200).sort((a, b) => a - b); return { n: window.__raf.length, p50: x[x.length >> 1], p90: x[Math.floor(x.length * 0.9)], max: x[x.length - 1] } })
console.log('raf cb ms', JSON.stringify(r))
await browser.close()
