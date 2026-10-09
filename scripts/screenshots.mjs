/**
 * Captures visuelles (desktop + mobile) avec Playwright.
 * Usage : npm run test:visual [-- baseUrl outDir route...]   (serveur : npm run preview)
 * Variables : QUERY="?q=low" (qualité), SETTLE=ms (attente après chargement).
 * Exemple : node scripts/screenshots.mjs http://localhost:4173 docs/screenshots "#/atelier/submariner"
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const base = process.argv[2] ?? 'http://localhost:4173'
const out = process.argv[3] ?? 'docs/screenshots'
const routes = process.argv.slice(4)
const scenarios = routes.length
  ? routes.map((r) => ({ name: r.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home', route: r }))
  : [
      { name: 'landing-hero', route: '#/' },
      { name: 'atelier-submariner', route: '#/atelier/submariner' },
      { name: 'atelier-datejust', route: '#/atelier/datejust' },
      { name: 'atelier-daytona', route: '#/atelier/daytona' },
      { name: 'atelier-exploded', route: '#/atelier/submariner', keys: ['2'], wait: 9000 },
      { name: 'atelier-movement', route: '#/atelier/datejust', keys: ['3'], wait: 10000 },
      { name: 'atelier-xray', route: '#/atelier/daytona', keys: ['4'], wait: 9000 },
    ]
const viewports = [
  { tag: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { tag: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
]

fs.mkdirSync(out, { recursive: true })
// Chromium préinstallé (CI / conteneurs) si défini, sinon celui de Playwright.
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined)
const browser = await chromium.launch({
  executablePath,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error(`[${vp.tag}] pageerror:`, e.message))
  page.on('console', (m) => m.type() === 'error' && console.error(`[${vp.tag}] console:`, m.text()))
  for (const sc of scenarios) {
    await page.goto(`${base}/${process.env.QUERY ?? ''}${sc.route}`, { waitUntil: 'load' })
    if (sc.route.includes('atelier')) {
      await page.waitForSelector('.scene-canvas.is-ready', { timeout: 240000 })
      // rotation auto coupée : captures reproductibles
      const rot = page.locator('button[title^="Rotation auto"], button[title^="Auto-rotate"]').first()
      if ((await rot.getAttribute('aria-pressed')) === 'true') await rot.click()
      await page.keyboard.press('v') // recentre sur la pose de référence
    }
    await page.waitForTimeout(Number(process.env.SETTLE ?? 16000))
    for (const k of sc.keys ?? []) await page.keyboard.press(k)
    if (sc.wait) await page.waitForTimeout(sc.wait)
    if (sc.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y * (document.body.scrollHeight - innerHeight)), sc.scroll)
      await page.waitForTimeout(3000)
    }
    const file = path.join(out, `${sc.name}-${vp.tag}.png`) // convertir ensuite en WebP pour la doc
    await page.screenshot({ path: file, timeout: 180000 })
    console.log('saved', file)
  }
  await ctx.close()
}
await browser.close()
