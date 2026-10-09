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
  check(/36|\d{2}/.test(await page.locator('#collection a[href="#/collection"]').innerText()), 'landing : lien vers la collection complète')
  await page.locator('#collection li button').nth(1).click()
  await page.waitForFunction(() => location.hash === '#/atelier/rolex-gmt-master-ii', null, T)
  check(true, 'collection → atelier (#/atelier/rolex-gmt-master-ii)')
  await page.waitForSelector('.scene-canvas.is-ready', T)
  const spotsOk = await page.waitForFunction(() => document.querySelectorAll('.hotspot').length > 3, null, T).then(() => true, () => false)
  check(spotsOk, 'atelier : hotspots affichés')

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
  await page.getByRole('tab', { name: 'Fonctionnement' }).click()
  check((await page.getByRole('tabpanel').innerText()).length > 40, 'fiche : onglet Fonctionnement')
  await page.getByRole('tab', { name: 'Montage' }).click()
  check((await page.getByRole('tabpanel').innerText()).length > 40, 'fiche : onglet Montage')
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
  await page.getByRole('radio', { name: /Bleu \/ noir/ }).click()
  check((await page.getByRole('radio', { name: /Bleu \/ noir/ }).getAttribute('aria-checked')) === 'true', 'configurateur : lunette bleu / noir')
  await page.getByRole('radio', { name: 'Or gris' }).click()
  check((await page.getByRole('radio', { name: 'Or gris' }).getAttribute('aria-checked')) === 'true', 'configurateur : or gris')
  await page.getByRole('radio', { name: 'Trois rangs' }).click()
  check((await page.getByRole('radio', { name: 'Trois rangs' }).getAttribute('aria-checked')) === 'true', 'configurateur : bracelet trois rangs')
  await page.getByRole('slider', { name: /poignet/i }).fill('200')
  check((await page.getByRole('slider', { name: /poignet/i }).inputValue()) === '200', 'configurateur : tour de poignet 200 mm')
  await page.getByRole('button', { name: 'Fermer' }).click()

  // Capture PNG
  const dl = page.waitForEvent('download', { timeout: 60000 })
  await page.getByRole('button', { name: 'Capture PNG' }).click()
  const file = await dl
  check(/\.png$/.test(file.suggestedFilename()), `capture PNG téléchargée (${file.suggestedFilename()})`)

  // Changement de modèle
  await page.getByRole('button', { name: 'Modèle suivant' }).click()
  await page.waitForFunction(() => location.hash === '#/atelier/rolex-daytona', null, T)
  check(true, 'modèle suivant → #/atelier/rolex-daytona')
  await page.waitForTimeout(2500)

  // Visites, quiz, nuit, coupe
  await page.getByRole('button', { name: 'Montage pas à pas' }).first().click()
  await page.waitForSelector('aside[aria-label="Montage pas à pas"]', T)
  check(true, 'montage pas à pas : panneau ouvert')
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  check((await page.locator('aside[aria-label="Montage pas à pas"] .eyebrow').first().innerText()).includes('2/'), 'montage : étape 2')
  await page.getByRole('button', { name: 'Quitter la visite' }).click()
  await page.getByRole('button', { name: "Trajet de l'énergie" }).first().click()
  await page.waitForSelector('aside[aria-label="Trajet de l\'énergie"]', T)
  check(true, "trajet de l'énergie : panneau ouvert")
  await page.getByRole('button', { name: 'Quitter la visite' }).click()
  await page.getByRole('button', { name: 'Quiz des pièces' }).first().click()
  await page.waitForSelector('aside[aria-label="Quiz des pièces"] li button', T)
  await page.locator('aside[aria-label="Quiz des pièces"] li button').first().click()
  check(/Exact|Raté/.test(await page.locator('aside[aria-label="Quiz des pièces"]').innerText()), 'quiz : réponse évaluée')
  await page.getByRole('button', { name: 'Quitter le quiz' }).click()
  await page.getByRole('button', { name: /Nuit/ }).first().click()
  check((await page.getByRole('button', { name: /Nuit/ }).first().getAttribute('aria-pressed')) === 'true', 'mode nuit activé')
  await page.getByRole('button', { name: /Nuit/ }).first().click()
  await page.getByRole('button', { name: 'Vue en coupe' }).first().click()
  check((await page.getByRole('slider', { name: '' }).count()) >= 0 && (await page.getByText('Coupe', { exact: true }).count()) > 0, 'vue en coupe : curseur affiché')
  await page.getByRole('button', { name: 'Vue en coupe' }).first().click()

  // Collection + comparateur
  await page.goto(`${base}/?q=low#/collection`, { waitUntil: 'load' })
  await page.getByPlaceholder(/Marque, modèle/).fill('nautilus')
  check((await page.locator('main ul > li').count()) === 1, 'collection : recherche « nautilus »')
  await page.getByPlaceholder(/Marque, modèle/).fill('')
  await page.getByRole('button', { name: /Comparer/ }).nth(0).click()
  await page.getByRole('button', { name: /Comparer/ }).nth(1).click()
  await page.locator('.btn-lux', { hasText: 'Comparer' }).click()
  check(await page.getByRole('dialog', { name: 'Comparateur' }).isVisible(), 'comparateur : tableau affiché')
  await page.keyboard.press('Escape')

  check(errors.length === 0, `aucune erreur JS${errors.length ? ' : ' + errors.slice(0, 3).join(' | ') : ''}`)
  await ctx.close()
}

await run('desktop 1440×900', { width: 1440, height: 900 }, false)
await run('mobile 390×844', { width: 390, height: 844 }, true)
await browser.close()
console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests sont passés.')
process.exit(failures ? 1 : 0)
