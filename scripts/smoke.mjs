/**
 * Test de fumée end-to-end (Playwright) : navigation, modes, sélection, isolation,
 * configurateur, raccourcis, capture PNG, absence d'erreurs JS — desktop puis mobile.
 *
 * Usage : npm run build && npm run preview  (autre terminal)
 *         npm run test:smoke [-- http://localhost:4173]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

let failures = 0
const check = (cond, label) => {
  console.log(`${cond ? '✓' : '✗'} ${label}`)
  if (!cond) failures++
}
const T = { timeout: 240000 }

async function run(tag, viewport, mobile) {
  console.log(`\n— ${tag}`)
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, acceptDownloads: true, locale: 'fr-FR' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  // Landing : façade puis 3D
  await page.goto(`${base}/?q=low#/`, { waitUntil: 'load' })
  check(await page.locator('h1').first().isVisible(), 'landing : titre du hero visible')
  check((await page.locator('.hero-poster').count()) === 1, 'landing : poster de façade présent')
  await page.mouse.move(100, 100)
  await page.evaluate(() => window.scrollBy(0, 1))
  await page.waitForSelector('.scene-canvas.is-ready', T)
  check(true, 'landing : scène 3D prête après interaction')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(800)
  check(await page.locator('#collection').isVisible(), 'landing : section collection atteinte')

  // Atelier
  await page.locator('#collection button').nth(1).click()
  await page.waitForFunction(() => location.hash === '#/atelier/submariner', null, T)
  check(true, 'collection → atelier (#/atelier/submariner)')
  await page.waitForSelector('.scene-canvas.is-ready', T)
  await page.waitForTimeout(1500)
  check((await page.locator('.hotspot').count()) > 3, 'atelier : hotspots affichés')

  // Modes
  await page.getByRole('radio', { name: /Éclaté/ }).first().click()
  await page.waitForTimeout(500)
  check((await page.locator('input[type=range]').inputValue()) === '100', 'mode Éclaté → éclatement 100 %')
  await page.getByRole('radio', { name: /Normal/ }).first().click()
  await page.waitForTimeout(300)
  check((await page.locator('input[type=range]').inputValue()) === '0', 'mode Normal → éclatement 0 %')
  await page.locator('input[type=range]').fill('40')
  check((await page.getByRole('radio', { name: /Éclaté/ }).first().getAttribute('aria-checked')) === 'true', 'slider → bascule en mode Éclaté')

  // Sélection via hotspot puis panneau
  // premier repère visible et non masqué par l'interface (les repères bougent avec la caméra :
  // on vérifie la cible au point de clic puis on clique sans attendre la stabilité)
  await page.keyboard.press('r') // coupe la rotation automatique
  const spots = page.locator('.hotspot')
  let clicked = false
  for (let i = 0; i < (await spots.count()) && !clicked; i++) {
    const h = spots.nth(i)
    const hit = await h.evaluate((e) => {
      const r = e.getBoundingClientRect()
      return Number(e.style.opacity || '1') > 0.5 && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.hotspot') === e
    })
    if (!hit) continue
    await h.click({ force: true })
    clicked = true
  }
  check(clicked, 'un repère est cliquable')
  await page.waitForSelector('#part-title', T)
  check(true, `hotspot → fiche pièce « ${await page.locator('#part-title').innerText()} »`)
  await page.getByRole('button', { name: /Isoler/ }).click()
  check((await page.getByRole('button', { name: /Tout afficher/ }).count()) === 1, 'isolation activée')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  check((await page.locator('#part-title').count()) === 0, 'Échap ferme la fiche')

  if (!mobile) {
    await page.keyboard.press('ArrowRight')
    await page.waitForSelector('#part-title', T)
    check(true, 'raccourci → sélectionne une pièce')
    await page.keyboard.press('Escape')
    await page.keyboard.press('4')
    await page.waitForTimeout(300)
    check((await page.getByRole('radio', { name: /Rayons X/ }).first().getAttribute('aria-checked')) === 'true', 'raccourci 4 → Rayons X')
    await page.keyboard.press('?')
    check(await page.getByRole('dialog').isVisible(), 'raccourci ? → aide')
    await page.keyboard.press('Escape')
    await page.keyboard.press('1')
  }

  // Configurateur
  await page.getByRole('button', { name: 'Configurer' }).click()
  await page.getByRole('radio', { name: 'Vert soleillé' }).click()
  check((await page.getByRole('radio', { name: 'Vert soleillé' }).getAttribute('aria-checked')) === 'true', 'configurateur : cadran vert')
  await page.getByRole('radio', { name: 'Or rose' }).click()
  check((await page.getByRole('radio', { name: 'Or rose' }).getAttribute('aria-checked')) === 'true', 'configurateur : or rose')
  await page.getByRole('radio', { name: 'Cinq rangs' }).click()
  check((await page.getByRole('radio', { name: 'Cinq rangs' }).getAttribute('aria-checked')) === 'true', 'configurateur : bracelet cinq rangs')
  await page.getByRole('button', { name: 'Fermer' }).click()

  // Capture PNG
  const dl = page.waitForEvent('download', { timeout: 60000 })
  await page.getByRole('button', { name: 'Capture PNG' }).click()
  const file = await dl
  check(/\.png$/.test(file.suggestedFilename()), `capture PNG téléchargée (${file.suggestedFilename()})`)

  // Changement de modèle
  await page.getByRole('button', { name: /Daytona/ }).click()
  await page.waitForFunction(() => location.hash === '#/atelier/daytona', null, T)
  check(true, 'navigation modèle → #/atelier/daytona')
  await page.waitForTimeout(2500)

  check(errors.length === 0, `aucune erreur JS${errors.length ? ' : ' + errors.slice(0, 3).join(' | ') : ''}`)
  await ctx.close()
}

await run('desktop 1440×900', { width: 1440, height: 900 }, false)
await run('mobile 390×844', { width: 390, height: 844 }, true)
await browser.close()
console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests sont passés.')
process.exit(failures ? 1 : 0)
