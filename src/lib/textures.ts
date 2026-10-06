import * as THREE from 'three'

const TAU = Math.PI * 2
const SERIF = '"Cormorant Garamond", "Times New Roman", serif'
const SANS = '"Inter Variable", "Helvetica Neue", Arial, sans-serif'

function canvas(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  return { c, ctx }
}

/** Contexte en coordonnées « monde » (mm, y vers le haut), centré, couvrant [-R, R]. */
function worldCtx(ctx: CanvasRenderingContext2D, size: number, R: number) {
  const k = size / (2 * R)
  ctx.setTransform(k, 0, 0, -k, size / 2, size / 2)
  return k
}

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  opts: { size: number; angle?: number; font?: string; weight?: number | string; align?: CanvasTextAlign; spacing?: number; italic?: boolean },
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(opts.angle ?? 0)
  ctx.scale(1, -1)
  // Les polices canvas ont besoin d'une taille en px : on travaille à x100 puis on réduit.
  ctx.scale(0.01, 0.01)
  ctx.font = `${opts.italic ? 'italic ' : ''}${opts.weight ?? 500} ${opts.size * 100}px ${opts.font ?? SANS}`
  ctx.textAlign = opts.align ?? 'center'
  ctx.textBaseline = 'middle'
  if (opts.spacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.spacing * 100}px`
  ctx.fillText(str, 0, 0)
  ctx.restore()
}

/** Texte disposé en arc (centré sur l'angle `mid`, lecture dans le sens horaire si `outward`). */
function arcText(
  ctx: CanvasRenderingContext2D,
  str: string,
  r: number,
  mid: number,
  size: number,
  spacingMM: number,
  font = SANS,
  weight: number | string = 500,
  bottom = false,
) {
  const chars = [...str]
  const widths = chars.map((ch) => {
    ctx.save()
    ctx.font = `${weight} ${size * 100}px ${font}`
    const w = ctx.measureText(ch).width / 100
    ctx.restore()
    return w + spacingMM
  })
  const total = widths.reduce((a, b) => a + b, 0)
  let a = bottom ? mid - total / 2 / r : mid + total / 2 / r
  chars.forEach((ch, i) => {
    const w = widths[i]
    const ac = bottom ? a + w / 2 / r : a - w / 2 / r
    const x = Math.cos(ac) * r
    const y = Math.sin(ac) * r
    text(ctx, ch, x, y, { size, angle: bottom ? ac + Math.PI / 2 : ac - Math.PI / 2, font, weight })
    a = bottom ? a + w / r : a - w / r
  })
}

function finish(c: HTMLCanvasElement, srgb = true, aniso = 8) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.needsUpdate = true
  return t
}

/** Angle « montre » (0 = 12 h, sens horaire) -> angle trigonométrique. */
const clock = (frac: number) => Math.PI / 2 - frac * TAU

export interface DialPrint {
  base: string
  print: string
  sub: string
  model: 'datejust' | 'submariner' | 'daytona'
  R: number
  size: number
  date: boolean
}

/** Texture du cadran : fond soleillé, chemin de fer, textes, compteurs. */
export function makeDialTexture(o: DialPrint) {
  const { c, ctx } = canvas(o.size)
  const R = o.R
  worldCtx(ctx, o.size, R)
  const base = new THREE.Color(o.base)
  const light = base.clone().lerp(new THREE.Color('#ffffff'), 0.1).getStyle()
  const dark = base.clone().multiplyScalar(0.55).getStyle()

  // Fond : dégradé radial (centre plus clair, bord fumé)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
  g.addColorStop(0, light)
  g.addColorStop(0.65, o.base)
  g.addColorStop(1, dark)
  ctx.fillStyle = g
  ctx.fillRect(-R, -R, 2 * R, 2 * R)

  // Brossage soleillé : fins rayons quasi invisibles
  ctx.save()
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 720; i++) {
    const a = (i / 720) * TAU
    ctx.strokeStyle = i % 2 ? '#ffffff' : '#000000'
    ctx.lineWidth = 0.02 + Math.random() * 0.03
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * 0.6, Math.sin(a) * 0.6)
    ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R)
    ctx.stroke()
  }
  ctx.restore()

  ctx.fillStyle = o.print
  ctx.strokeStyle = o.print

  // Chemin de fer (minutes)
  const rOut = R - 0.55
  for (let i = 0; i < 60; i++) {
    const a = clock(i / 60)
    const five = i % 5 === 0
    const len = o.model === 'submariner' ? (five ? 0 : 0.55) : five ? 0.9 : 0.55
    if (len === 0) continue
    ctx.lineWidth = five ? 0.22 : 0.12
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * rOut, Math.sin(a) * rOut)
    ctx.lineTo(Math.cos(a) * (rOut - len), Math.sin(a) * (rOut - len))
    ctx.stroke()
  }
  if (o.model !== 'submariner') {
    ctx.lineWidth = 0.06
    ctx.beginPath()
    ctx.arc(0, 0, rOut, 0, TAU)
    ctx.stroke()
  }

  // Branding générique (aucune marque déposée)
  if (o.model === 'daytona') {
    text(ctx, 'ATELIER', 0, 9.6, { size: 1.55, font: SERIF, weight: 600, spacing: 0.25 })
    text(ctx, 'CHRONOGRAPHE', 0, 7.6, { size: 0.62, weight: 500, spacing: 0.12 })
    text(ctx, 'AUTOMATIQUE', 0, 2.5, { size: 0.55, weight: 400, spacing: 0.1 })
    text(ctx, 'CHRONOMÈTRE CERTIFIÉ', 0, -11.4, { size: 0.5, weight: 400, spacing: 0.08 })
  } else if (o.model === 'submariner') {
    text(ctx, 'ATELIER', 0, 7.3, { size: 1.6, font: SERIF, weight: 600, spacing: 0.25 })
    text(ctx, 'AUTOMATIQUE', 0, 5.6, { size: 0.62, weight: 500, spacing: 0.12 })
    text(ctx, 'ABYSSES', 0, -4.6, { size: 0.95, font: SERIF, weight: 600, italic: true, spacing: 0.08 })
    text(ctx, '300 m ⁄ 1000 ft', 0, -5.9, { size: 0.58, weight: 500, spacing: 0.04 })
    text(ctx, 'CHRONOMÈTRE CERTIFIÉ', 0, -7.1, { size: 0.5, weight: 400, spacing: 0.08 })
  } else {
    text(ctx, 'ATELIER', 0, 7.3, { size: 1.6, font: SERIF, weight: 600, spacing: 0.25 })
    text(ctx, 'AUTOMATIQUE', 0, 5.6, { size: 0.62, weight: 500, spacing: 0.12 })
    text(ctx, 'Quantième', 0, -5.8, { size: 1.0, font: SERIF, weight: 500, italic: true })
    text(ctx, 'CHRONOMÈTRE CERTIFIÉ', 0, -7.2, { size: 0.5, weight: 400, spacing: 0.08 })
  }
  // Signature discrète à 6 h, sur le chemin de fer
  text(ctx, '· AT ·', 0, -(R - 2.2), { size: 0.42, weight: 500, spacing: 0.06 })

  // Compteurs du chronographe
  if (o.model === 'daytona') {
    const subs: [number, number, number, string[]][] = [
      [7.4, 0, 30, ['10', '20', '30']],
      [0, -7.4, 12, ['3', '6', '9', '12']],
      [-7.4, 0, 60, ['20', '40', '60']],
    ]
    for (const [cx, cy, n, labels] of subs) {
      const rs = 3.55
      ctx.save()
      ctx.translate(cx, cy)
      ctx.fillStyle = o.sub
      ctx.beginPath()
      ctx.arc(0, 0, rs, 0, TAU)
      ctx.fill()
      // Azurage (cercles concentriques)
      ctx.globalAlpha = 0.18
      ctx.strokeStyle = o.print
      ctx.lineWidth = 0.035
      for (let r = 0.3; r < rs; r += 0.13) {
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, TAU)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.lineWidth = 0.12
      ctx.beginPath()
      ctx.arc(0, 0, rs, 0, TAU)
      ctx.stroke()
      const subPrint = new THREE.Color(o.sub).getHSL({ h: 0, s: 0, l: 0 }).l > 0.5 ? '#16171a' : o.print
      ctx.strokeStyle = subPrint
      ctx.fillStyle = subPrint
      const ticks = n === 12 ? 24 : n === 30 ? 30 : 60
      for (let i = 0; i < ticks; i++) {
        const a = clock(i / ticks)
        const major = n === 12 ? i % 2 === 0 : n === 30 ? i % 5 === 0 : i % 5 === 0
        const len = major ? 0.55 : 0.28
        ctx.lineWidth = major ? 0.1 : 0.05
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * (rs - 0.15), Math.sin(a) * (rs - 0.15))
        ctx.lineTo(Math.cos(a) * (rs - 0.15 - len), Math.sin(a) * (rs - 0.15 - len))
        ctx.stroke()
      }
      labels.forEach((lab, i) => {
        const a = clock((i + 1) / labels.length)
        text(ctx, lab, Math.cos(a) * (rs - 1.35), Math.sin(a) * (rs - 1.35), { size: 0.62, weight: 500 })
      })
      ctx.restore()
    }
  }

  // Cadre du guichet de date
  if (o.date) {
    ctx.lineWidth = 0.14
    ctx.strokeStyle = o.print
    ctx.globalAlpha = 0.65
    ctx.strokeRect(10.05, -1.4, 3.5, 2.8)
    ctx.globalAlpha = 1
  }
  return finish(c)
}

/**
 * Carte d'anisotropie (KHR_materials_anisotropy) : direction tangentielle en chaque point,
 * qui produit le reflet « soleillé » caractéristique.
 */
export function makeSunburstAnisotropy(size = 256) {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size - 0.5
      const v = (y + 0.5) / size - 0.5
      const a = Math.atan2(v, u)
      // direction tangentielle
      const dx = -Math.sin(a)
      const dy = Math.cos(a)
      const i = (y * size + x) * 4
      data[i] = Math.round((dx * 0.5 + 0.5) * 255)
      data[i + 1] = Math.round((dy * 0.5 + 0.5) * 255)
      data[i + 2] = 255
      data[i + 3] = 255
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearFilter
  t.needsUpdate = true
  return t
}

/** Insert de lunette : échelle de plongée 60 min ou tachymètre. */
export function makeBezelTexture(o: { style: 'dive' | 'tachy'; base: string; print: string; R: number; rIn: number; size: number }) {
  const { c, ctx } = canvas(o.size)
  const R = o.R
  worldCtx(ctx, o.size, R)
  ctx.fillStyle = o.base
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  // léger dégradé radial pour la profondeur de la céramique
  const g = ctx.createRadialGradient(0, 0, o.rIn, 0, 0, R)
  g.addColorStop(0, 'rgba(255,255,255,0.05)')
  g.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = g
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.fillStyle = o.print
  ctx.strokeStyle = o.print
  const mid = (R + o.rIn) / 2
  const band = R - o.rIn

  if (o.style === 'dive') {
    for (let i = 0; i < 60; i++) {
      const a = clock(i / 60)
      const isTen = i % 10 === 0
      const isFive = i % 5 === 0
      if (i === 0) {
        // triangle à 12 h (la perle luminescente est en géométrie)
        ctx.save()
        ctx.rotate(a - Math.PI / 2)
        ctx.beginPath()
        ctx.moveTo(-1.25, mid + band * 0.36)
        ctx.lineTo(1.25, mid + band * 0.36)
        ctx.lineTo(0, mid - band * 0.36)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
        continue
      }
      if (isTen) {
        text(ctx, String(i), Math.cos(a) * mid, Math.sin(a) * mid, {
          size: band * 0.6,
          angle: a - Math.PI / 2,
          weight: 600,
          spacing: -0.02,
        })
      } else if (isFive) {
        ctx.save()
        ctx.rotate(a - Math.PI / 2)
        ctx.fillRect(-0.42, mid - band * 0.3, 0.84, band * 0.6)
        ctx.restore()
      } else if (i < 15) {
        ctx.lineWidth = 0.22
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * (mid + band * 0.33), Math.sin(a) * (mid + band * 0.33))
        ctx.lineTo(Math.cos(a) * (mid - band * 0.05), Math.sin(a) * (mid - band * 0.05))
        ctx.stroke()
      }
    }
  } else {
    // Tachymètre : vitesse = 3600 / secondes écoulées
    const values = [400, 300, 240, 200, 180, 160, 140, 120, 110, 100, 90, 80, 75, 70, 65, 60]
    values.forEach((v) => {
      const s = 3600 / v
      const a = clock(s / 60)
      text(ctx, String(v), Math.cos(a) * (mid - band * 0.12), Math.sin(a) * (mid - band * 0.12), {
        size: band * 0.36,
        angle: a - Math.PI / 2,
        weight: 600,
      })
      ctx.lineWidth = 0.14
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * (R - 0.15), Math.sin(a) * (R - 0.15))
      ctx.lineTo(Math.cos(a) * (R - band * 0.26), Math.sin(a) * (R - band * 0.26))
      ctx.stroke()
    })
    for (let v = 400; v >= 60; v -= v > 200 ? 20 : v > 100 ? 10 : 5) {
      const a = clock(3600 / v / 60)
      ctx.lineWidth = 0.06
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * (R - 0.15), Math.sin(a) * (R - 0.15))
      ctx.lineTo(Math.cos(a) * (R - band * 0.16), Math.sin(a) * (R - band * 0.16))
      ctx.stroke()
    }
    arcText(ctx, 'TACHYMÈTRE', mid - band * 0.1, clock(0.88), band * 0.3, band * 0.07, SANS, 600)
    arcText(ctx, 'UNITÉS PAR HEURE', mid - band * 0.1, clock(0.5), band * 0.24, band * 0.05, SANS, 500, true)
  }
  return finish(c)
}

/** Disque de quantième : 31 chiffres en anneau, `day` aligné sur 3 h. */
export function makeDateTexture(day: number, R: number, size = 1024) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  ctx.fillStyle = '#f4f2ec'
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.fillStyle = '#0d0d0f'
  for (let d = 1; d <= 31; d++) {
    const a = ((d - day) / 31) * TAU
    const r = 11.8
    text(ctx, String(d), Math.cos(a) * r, Math.sin(a) * r, {
      size: 2.05,
      angle: a,
      font: SANS,
      weight: 650,
      spacing: -0.12,
    })
  }
  return finish(c)
}

/** Perlage (graining circulaire) : bump + rugosité pour la platine. */
export function makePerlage(size = 512, cells = 16) {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  const step = size / cells
  for (let y = -1; y <= cells; y++) {
    for (let x = -1; x <= cells; x++) {
      const cx = (x + (y % 2) * 0.5) * step
      const cy = y * step * 0.92
      const r = step * 0.68
      for (let k = 0; k < 28; k++) {
        const a0 = (k / 28) * TAU
        ctx.strokeStyle = k % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(cx, cy, r * (0.2 + 0.8 * ((k * 7) % 28) / 28), a0, a0 + 1.2)
        ctx.stroke()
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(255,255,255,0.25)')
      g.addColorStop(1, 'rgba(0,0,0,0.0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, TAU)
      ctx.fill()
    }
  }
  const t = finish(c, false, 4)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Côtes de Genève : bandes parallèles bombées. */
export function makeGenevaStripes(size = 512, stripes = 7) {
  const { c, ctx } = canvas(size)
  const w = size / stripes
  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate(-0.5)
  for (let i = -stripes; i < stripes * 2; i++) {
    const x = i * w - size
    const g = ctx.createLinearGradient(x, 0, x + w, 0)
    g.addColorStop(0, '#3a3a3a')
    g.addColorStop(0.45, '#e0e0e0')
    g.addColorStop(0.55, '#d0d0d0')
    g.addColorStop(1, '#3a3a3a')
    ctx.fillStyle = g
    ctx.fillRect(x, -size * 1.5, w, size * 3)
  }
  ctx.restore()
  const t = finish(c, false, 4)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Masse oscillante : gravure en arc + brossage circulaire. */
export function makeRotorTexture(R: number, size = 1024) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  ctx.fillStyle = '#b9bcc2'
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.globalAlpha = 0.25
  for (let r = 0.5; r < R; r += 0.09) {
    ctx.strokeStyle = Math.random() > 0.5 ? '#ffffff' : '#6d7076'
    ctx.lineWidth = 0.04
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, TAU)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#c8a660'
  arcText(ctx, 'ATELIER', 10.9, -Math.PI / 2, 1.5, 0.45, SERIF, 700, true)
  ctx.fillStyle = '#8a8d93'
  arcText(ctx, 'AUTOMATIQUE · 31 RUBIS', 8.6, -Math.PI / 2, 0.75, 0.12, SANS, 600, true)
  return finish(c)
}

/** Fine rayure « satinée » linéaire (rugosité). */
export function makeBrushed(size = 256) {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#7a7a7a'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * size
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + Math.random() * 0.12})`
    ctx.lineWidth = 0.5 + Math.random()
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y + (Math.random() - 0.5) * 2)
    ctx.stroke()
  }
  const t = finish(c, false, 8)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}
