/**
 * Génère l'image de façade du hero (public/poster.webp) à partir du rendu 3D réel.
 * Usage : npm run dev (dans un autre terminal), puis node scripts/make-poster.mjs [url]
 * Affiche en sortie les coordonnées CSS (en vh) à reporter dans src/data/poster.json.
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5173'
const W = 1440
const H = 900
const DPR = 2
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR })
await page.goto(`${base}/?poster&q=high#/`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__atelier?.store?.getState().sceneReady, null, { timeout: 300000 })
await page.waitForTimeout(Number(process.env.SETTLE ?? 45000))
const png = await page.screenshot({ timeout: 300000 })
await browser.close()

// Boîte englobante des pixels non noirs
const img = sharp(png)
const { data, info } = await img.clone().greyscale().raw().toBuffer({ resolveWithObject: true })
let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0
for (let y = 0; y < info.height; y++)
  for (let x = 0; x < info.width; x++)
    if (data[y * info.width + x] > 24) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
const pad = 24 * DPR
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad)
x1 = Math.min(info.width - 1, x1 + pad); y1 = Math.min(info.height - 1, y1 + pad)
const w = x1 - x0, h = y1 - y0
await sharp(png).extract({ left: x0, top: y0, width: w, height: h }).resize({ width: Math.min(w, 1400) }).webp({ quality: 82, effort: 6 }).toFile('public/poster.webp')
await sharp('public/poster.webp').resize({ width: 760 }).webp({ quality: 80, effort: 6 }).toFile('public/poster-760.webp')
const vh = (px) => +((px / DPR / H) * 100).toFixed(2)
const out = {
  // position relative au centre horizontal de la fenêtre (proportionnelle à la hauteur, comme la projection 3D)
  desktop: { left: vh(x0 - (W * DPR) / 2), top: vh(y0), width: vh(w), height: vh(h) },
}
fs.writeFileSync('src/data/poster.json', JSON.stringify(out, null, 2) + '\n')
console.log(out, fs.statSync('public/poster.webp').size, 'bytes')
