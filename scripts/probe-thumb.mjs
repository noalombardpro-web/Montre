/** Sonde de rendu vignette (dev) : node scripts/probe-thumb.mjs <url> */
import { chromium } from 'playwright'
import fs from 'node:fs'
const [url] = process.argv.slice(2)
const browser = await chromium.launch({
  executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({ viewport: { width: 900, height: 900 } })
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log('console:', m.text().slice(0, 200)))
await page.goto(url, { waitUntil: 'load' })
await page.waitForFunction(() => window.__atelier?.store?.getState().sceneReady, null, { timeout: 240000 })
await page.waitForTimeout(3000)
console.log(JSON.stringify(await page.evaluate(() => {
  const c = document.querySelector('canvas')
  const gl = c.getContext('webgl2')
  const s = window.__atelier.scene
  const g = s.getObjectByName(`watch-${window.__atelier.store.getState().watchId}`)
  let meshes = 0, visible = 0
  g?.traverse((o) => { if (o.isMesh) { meshes++; if (o.visible) visible++ } })
  return {
    canvas: [c.width, c.height, c.className],
    alpha: gl.getContextAttributes().alpha,
    clear: Array.from(gl.getParameter(gl.COLOR_CLEAR_VALUE)),
    htmlClass: document.documentElement.className,
    watchGroup: !!g, meshes, visible,
    groupPos: g ? g.position.toArray() : null,
    groupScale: g ? g.scale.toArray() : null,
    camera: window.__atelier.scene.children.find((o) => o.isPerspectiveCamera)?.position.toArray() ?? null,
  }
})))
await browser.close()
