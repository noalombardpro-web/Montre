/**
 * Vignettes 3D : chaque référence est rendue par le moteur 3D du projet, fond transparent,
 * cadrage identique. Sortie : public/thumbs/<id>.webp (720 px).
 * Usage : npm run thumbs -- [url] [id …]      (serveur de dev requis : npm run dev)
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5173'
const only = process.argv.slice(3)
const src = fs.readFileSync('src/data/watches.ts', 'utf8')
const all = [...src.matchAll(/\n {4}id: '([^']+)',\n {4}brand:/g)].map((m) => m[1])
const ids = only.length ? only : all
const SIZE = Number(process.env.SIZE ?? 720)
// caméra : trois quarts avant, identique pour toutes les montres
const VIEW = { pos: [70, 34, 150], target: [0, -1, -3] }

fs.mkdirSync('public/thumbs', { recursive: true })
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
let ok = 0
for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 })
  try {
    await page.goto(`${base}/?thumb&q=high#/atelier/${id}`, { waitUntil: 'load' })
    await page.waitForFunction(
      () => {
        const s = window.__atelier?.store?.getState()
        return !!s && s.staged && s.sceneReady
      },
      null,
      { timeout: 300000 },
    )
    await page.evaluate(() => window.__atelier.store.getState().set({ autoRotate: false }))
    await page.waitForTimeout(Number(process.env.SETTLE ?? 4000))
    await page.evaluate(([p, t]) => window.__atelier.setView(p, t), [VIEW.pos, VIEW.target])
    await page.waitForTimeout(1500)
    const png = await page.screenshot({ omitBackground: true, timeout: 240000 })
    await sharp(png)
      .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 88, alphaQuality: 100, effort: 5 })
      .toFile(`public/thumbs/${id}.webp`)
    ok++
    console.log(`✓ ${id}`)
  } catch (e) {
    console.error(`✗ ${id}: ${String(e.message).split('\n')[0]}`)
  } finally {
    await page.close()
  }
}
await browser.close()
console.log(`${ok}/${ids.length} vignettes`)
process.exit(ok === ids.length ? 0 : 1)
