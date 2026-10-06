/**
 * npm run export:glb — exporte les montres procédurales en GLB (nœuds nommés selon parts.json)
 * vers public/models/<id>.src.glb, puis `npm run optimize` produit les versions compressées.
 * Nécessite le serveur de dev : `npm run dev` (l'exporteur n'existe qu'en développement).
 *
 * Usage : npm run export:glb [-- http://localhost:5173]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5173'
const ids = ['datejust', 'submariner', 'daytona']
fs.mkdirSync('public/models', { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
for (const id of ids) {
  await page.goto(`${base}/?q=high&export=${id}#/atelier/${id}`, { waitUntil: 'load' })
  await page.waitForFunction(() => window.__atelier?.store?.getState().sceneReady, null, { timeout: 300000 })
  // attend la fin des textures différées
  await page.waitForTimeout(4000)
  const b64 = await page.evaluate(async (id) => {
    const buf = await window.__atelier.exportGLB(id)
    let bin = ''
    const bytes = new Uint8Array(buf)
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(bin)
  }, id)
  const file = `public/models/${id}.src.glb`
  fs.writeFileSync(file, Buffer.from(b64, 'base64'))
  console.log(`✓ ${file} ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} Mo`)
}
await browser.close()
