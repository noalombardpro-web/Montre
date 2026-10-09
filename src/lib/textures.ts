import * as THREE from 'three'
import type { DialPattern, WatchStyle } from '../data/watches'
import { DATE_WIN, DAY_WIN, hourPos, numeralBlocked, type DialLayout } from '../models/dialLayout'

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

/**
 * Texture différée : un placeholder 4×4 (même shader, aucun recompilage) est utilisé
 * immédiatement ; le vrai canvas est dessiné plus tard par l'ordonnanceur.
 */
export function deferredTexture(make: () => THREE.Texture, opts: { color?: string; srgb?: boolean; repeat?: boolean } = {}) {
  const { c, ctx } = canvas(4)
  ctx.fillStyle = opts.color ?? '#808080'
  ctx.fillRect(0, 0, 4, 4)
  const tex = new THREE.CanvasTexture(c)
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace
  if (opts.repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  const family = new Set<THREE.Texture>([tex])
  let image: HTMLCanvasElement | null = null
  /** Copie (répétition/offset propres) qui recevra aussi l'image finale. */
  const derive = () => {
    const t = tex.clone()
    if (image) {
      t.image = image
      t.needsUpdate = true
    }
    family.add(t)
    return t
  }
  const job = () => {
    image = make().image as HTMLCanvasElement
    family.forEach((t) => {
      // le stockage GPU est immuable (texStorage2D) : on libère avant de changer de dimensions
      t.dispose()
      t.image = image
      t.needsUpdate = true
    })
  }
  return { tex, job, derive }
}

/** Angle « montre » (0 = 12 h, sens horaire) -> angle trigonométrique. */
const clock = (frac: number) => Math.PI / 2 - frac * TAU

export interface DialPrint {
  base: string
  print: string
  sub: string
  lume: string
  R: number
  size: number
  style: WatchStyle
  layout: DialLayout
}

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

/** Motif décoratif dessiné dans la couleur du cadran. */
function drawPattern(ctx: CanvasRenderingContext2D, pattern: DialPattern, R: number, base: THREE.Color) {
  const hi = base.clone().lerp(new THREE.Color('#ffffff'), 0.22).getStyle()
  const lo = base.clone().multiplyScalar(0.62).getStyle()
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, TAU)
  ctx.clip()
  if (pattern === 'sunburst') {
    ctx.globalAlpha = 0.05
    for (let i = 0; i < 240; i++) {
      const a = (i / 240) * TAU
      ctx.strokeStyle = i % 2 ? '#ffffff' : '#000000'
      ctx.lineWidth = 0.02 + Math.random() * 0.03
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * 0.6, Math.sin(a) * 0.6)
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R)
      ctx.stroke()
    }
  } else if (pattern === 'tapisserie') {
    // « Tapisserie » : pyramides carrées en relief
    const step = 0.95
    for (let x = -R; x < R; x += step) {
      for (let y = -R; y < R; y += step) {
        ctx.fillStyle = hi
        ctx.globalAlpha = 0.5
        ctx.fillRect(x + 0.08, y + step * 0.5, step * 0.84, step * 0.42)
        ctx.fillStyle = lo
        ctx.globalAlpha = 0.6
        ctx.fillRect(x + 0.08, y + 0.08, step * 0.84, step * 0.42)
      }
    }
  } else if (pattern === 'horizontal') {
    for (let y = -R; y < R; y += 0.62) {
      ctx.fillStyle = hi
      ctx.globalAlpha = 0.35
      ctx.fillRect(-R, y, 2 * R, 0.22)
      ctx.fillStyle = lo
      ctx.globalAlpha = 0.45
      ctx.fillRect(-R, y + 0.3, 2 * R, 0.2)
    }
  } else if (pattern === 'waves') {
    ctx.lineWidth = 0.22
    for (let y = -R; y < R; y += 0.9) {
      ctx.strokeStyle = lo
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      for (let x = -R; x <= R; x += 0.3) {
        const yy = y + Math.sin(x * 0.55) * 0.35
        if (x === -R) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
  } else if (pattern === 'guilloche') {
    ctx.lineWidth = 0.05
    ctx.strokeStyle = lo
    ctx.globalAlpha = 0.5
    for (let r = 0.6; r < R; r += 0.32) {
      ctx.beginPath()
      for (let k = 0; k <= 360; k++) {
        const a = (k / 360) * TAU
        const rr = r + Math.sin(a * 24) * 0.12
        if (k === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      ctx.stroke()
    }
  } else if (pattern === 'grain') {
    // « Neige » : relief granuleux
    for (let i = 0; i < 9000; i++) {
      const x = (Math.random() * 2 - 1) * R
      const y = (Math.random() * 2 - 1) * R
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#9aa3ad'
      ctx.globalAlpha = 0.18 + Math.random() * 0.2
      ctx.beginPath()
      ctx.arc(x, y, 0.05 + Math.random() * 0.12, 0, TAU)
      ctx.fill()
    }
  } else if (pattern === 'matte') {
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000'
      ctx.globalAlpha = 0.03
      ctx.fillRect((Math.random() * 2 - 1) * R, (Math.random() * 2 - 1) * R, 0.12, 0.12)
    }
  }
  ctx.restore()
}

/** Texture du cadran : fond, motif, chemin de fer, chiffres, impressions, compteurs, guichets. */
export function makeDialTexture(o: DialPrint) {
  const { c, ctx } = canvas(o.size)
  const R = o.R
  const s = o.style
  const L = o.layout
  worldCtx(ctx, o.size, R)
  const base = new THREE.Color(o.base)
  const light = base.clone().lerp(new THREE.Color('#ffffff'), s.pattern === 'lacquer' || s.pattern === 'enamel' ? 0.06 : 0.12).getStyle()
  const dark = base.clone().multiplyScalar(s.pattern === 'enamel' ? 0.9 : 0.55).getStyle()

  // Fond : dégradé radial (centre plus clair, bord fumé)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
  g.addColorStop(0, light)
  g.addColorStop(0.65, o.base)
  g.addColorStop(1, dark)
  ctx.fillStyle = g
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  drawPattern(ctx, s.pattern, R, base)

  ctx.fillStyle = o.print
  ctx.strokeStyle = o.print

  // Chemin de fer (minutes)
  const rOut = R - 0.55
  const dive = s.indices === 'dive'
  for (let i = 0; i < 60; i++) {
    const a = clock(i / 60)
    const five = i % 5 === 0
    const len = dive ? (five ? 0 : 0.55) : five ? 0.9 : 0.55
    if (len === 0) continue
    ctx.lineWidth = five ? 0.22 : 0.12
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * rOut, Math.sin(a) * rOut)
    ctx.lineTo(Math.cos(a) * (rOut - len), Math.sin(a) * (rOut - len))
    ctx.stroke()
  }
  if (!dive) {
    ctx.lineWidth = 0.06
    ctx.beginPath()
    ctx.arc(0, 0, rOut, 0, TAU)
    ctx.stroke()
  }

  // Chiffres imprimés
  const numColor = s.lume !== false && (s.indices === 'explorer' || s.indices === 'arabic') ? o.lume : o.print
  if (s.indices === 'explorer') {
    for (const h of [3, 6, 9]) {
      if (numeralBlocked(L, h, 11.6)) continue
      const [x, y] = hourPos(h, 11.6)
      ctx.fillStyle = numColor
      text(ctx, String(h), x, y, { size: 3.4, weight: 700, font: SANS })
    }
  } else if (s.indices === 'arabic') {
    for (let h = 0; h < 12; h++) {
      const r = 10.9
      if (numeralBlocked(L, h, r)) continue
      const [x, y] = hourPos(h, r)
      ctx.fillStyle = numColor
      if (h === 0) {
        // triangle d'aviateur à 12 h
        ctx.beginPath()
        ctx.moveTo(-1.2, 13.4)
        ctx.lineTo(1.2, 13.4)
        ctx.lineTo(0, 11.2)
        ctx.closePath()
        ctx.fill()
        continue
      }
      text(ctx, String(h), x, y, { size: 2.6, weight: 650, font: SANS })
    }
  } else if (s.indices === 'roman') {
    for (let h = 0; h < 12; h++) {
      const r = 11.6
      if (numeralBlocked(L, h, r)) continue
      const a = clock(h / 12)
      ctx.fillStyle = o.print
      text(ctx, ROMAN[h], Math.cos(a) * r, Math.sin(a) * r, { size: 2.1, weight: 500, font: SERIF, angle: a - Math.PI / 2 })
    }
  }

  // Impressions génériques (aucune marque reproduite)
  ctx.fillStyle = o.print
  text(ctx, 'ATELIER', 0, L.topY, { size: 1.5, font: SERIF, weight: 600, spacing: 0.25 })
  s.print.top.forEach((line, i) => text(ctx, line, 0, L.topY - 1.6 - i * 1.0, { size: 0.6, weight: 500, spacing: 0.1 }))
  s.print.bottom.forEach((line, i) => text(ctx, line, 0, L.bottomY - i * 1.05, { size: i === 0 ? 0.62 : 0.5, weight: 500, spacing: 0.06 }))
  if (!L.subdials.some((d) => d.y < -5) && !L.moon) text(ctx, '· AT ·', 0, -(R - 2.2), { size: 0.42, weight: 500, spacing: 0.06 })

  // Compteurs auxiliaires
  for (const d of L.subdials) {
    const rs = d.r
    ctx.save()
    ctx.translate(d.x, d.y)
    ctx.fillStyle = o.sub
    ctx.beginPath()
    ctx.arc(0, 0, rs, 0, TAU)
    ctx.fill()
    // azurage (cercles concentriques)
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
    const n = d.kind === 'chronoHour' ? 12 : d.kind === 'chronoMin' ? 30 : 60
    const labels = d.kind === 'chronoHour' ? ['3', '6', '9', '12'] : d.kind === 'chronoMin' ? ['10', '20', '30'] : ['20', '40', '60']
    const ticks = n === 12 ? 24 : n === 30 ? 30 : 60
    for (let i = 0; i < ticks; i++) {
      const a = clock(i / ticks)
      const major = n === 12 ? i % 2 === 0 : i % 5 === 0
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

  // Cadres des guichets
  ctx.strokeStyle = o.print
  ctx.globalAlpha = 0.65
  ctx.lineWidth = 0.14
  if (L.date) {
    ctx.save()
    ctx.rotate(L.date.angle)
    ctx.strokeRect(L.date.r - DATE_WIN.w / 2 - 0.1, -DATE_WIN.h / 2 - 0.1, DATE_WIN.w + 0.2, DATE_WIN.h + 0.2)
    ctx.restore()
  }
  if (L.day) ctx.strokeRect(-DAY_WIN.w / 2 - 0.1, DAY_WIN.y - DAY_WIN.h / 2 - 0.1, DAY_WIN.w + 0.2, DAY_WIN.h + 0.2)
  if (L.moon) {
    ctx.beginPath()
    ctx.arc(L.moon.x, L.moon.y, L.moon.r + 0.12, 0, Math.PI)
    ctx.closePath()
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  return finish(c)
}

/** Relief du motif du cadran (bumpMap). */
export function makeDialBump(pattern: DialPattern, R: number, size = 1024) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  ctx.fillStyle = '#808080'
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  drawPattern(ctx, pattern === 'sunburst' ? 'matte' : pattern, R, new THREE.Color('#808080'))
  return finish(c, false, 4)
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

export type InsertStyle = 'dive' | 'tachy' | 'gmt' | 'gmt-metal' | 'slide'

/** Insert de lunette : plongée 60 min, tachymètre, 24 h bicolore, règle à calcul. */
export function makeBezelTexture(o: { style: InsertStyle; base: string; base2?: string; print: string; R: number; rIn: number; size: number }) {
  const { c, ctx } = canvas(o.size)
  const R = o.R
  worldCtx(ctx, o.size, R)
  ctx.fillStyle = o.base
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  if (o.style === 'gmt' && o.base2) {
    // moitié basse (6 h → 18 h, le « jour ») d'une autre couleur
    ctx.fillStyle = o.base2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, R, Math.PI, TAU)
    ctx.closePath()
    ctx.fill()
  }
  // léger dégradé radial pour la profondeur
  const g = ctx.createRadialGradient(0, 0, o.rIn, 0, 0, R)
  g.addColorStop(0, 'rgba(255,255,255,0.05)')
  g.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = g
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.fillStyle = o.print
  ctx.strokeStyle = o.print
  const mid = (R + o.rIn) / 2
  const band = R - o.rIn

  const triangle = (a: number) => {
    ctx.save()
    ctx.rotate(a - Math.PI / 2)
    ctx.beginPath()
    ctx.moveTo(-1.25, mid + band * 0.36)
    ctx.lineTo(1.25, mid + band * 0.36)
    ctx.lineTo(0, mid - band * 0.36)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  if (o.style === 'dive') {
    for (let i = 0; i < 60; i++) {
      const a = clock(i / 60)
      if (i === 0) {
        triangle(a)
        continue
      }
      if (i % 10 === 0) {
        text(ctx, String(i), Math.cos(a) * mid, Math.sin(a) * mid, { size: band * 0.6, angle: a - Math.PI / 2, weight: 600, spacing: -0.02 })
      } else if (i % 5 === 0) {
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
  } else if (o.style === 'gmt' || o.style === 'gmt-metal') {
    for (let h = 0; h < 24; h++) {
      const a = clock(h / 24)
      if (h === 0) {
        triangle(a)
        continue
      }
      if (h % 2 === 0) {
        text(ctx, String(h), Math.cos(a) * mid, Math.sin(a) * mid, { size: band * 0.52, angle: a - Math.PI / 2, weight: 600, spacing: -0.04 })
      } else {
        ctx.save()
        ctx.rotate(a - Math.PI / 2)
        ctx.fillRect(-0.3, mid - band * 0.25, 0.6, band * 0.5)
        ctx.restore()
      }
    }
  } else if (o.style === 'slide') {
    // Règle à calcul circulaire : échelle logarithmique 10 → 100, deux couronnes
    for (const [rr, flip] of [
      [mid + band * 0.2, 1],
      [mid - band * 0.22, -1],
    ] as const) {
      for (let v = 10; v < 100; v += v < 20 ? 0.5 : v < 50 ? 1 : 2) {
        const f = Math.log10(v) - 1
        const a = clock(f)
        const major = Number.isInteger(v / 5) && (v < 20 || v % 10 === 0)
        const len = major ? band * 0.16 : band * 0.08
        ctx.lineWidth = major ? 0.08 : 0.04
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
        ctx.lineTo(Math.cos(a) * (rr - flip * len), Math.sin(a) * (rr - flip * len))
        ctx.stroke()
        if (major) text(ctx, String(v), Math.cos(a) * (rr - flip * band * 0.24), Math.sin(a) * (rr - flip * band * 0.24), { size: band * 0.15, angle: a - Math.PI / 2, weight: 600 })
      }
    }
  } else {
    // Tachymètre : vitesse = 3600 / secondes écoulées
    const values = [400, 300, 240, 200, 180, 160, 140, 120, 110, 100, 90, 80, 75, 70, 65, 60]
    values.forEach((v) => {
      const a = clock(3600 / v / 60)
      text(ctx, String(v), Math.cos(a) * (mid - band * 0.12), Math.sin(a) * (mid - band * 0.12), { size: band * 0.36, angle: a - Math.PI / 2, weight: 600 })
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

/** Disque de quantième : 31 chiffres en anneau, `day` aligné sur l'angle du guichet. */
export function makeDateTexture(day: number, R: number, size = 1024, angle = 0, r = 11.8) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  ctx.fillStyle = '#f4f2ec'
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.fillStyle = '#0d0d0f'
  for (let d = 1; d <= 31; d++) {
    const a = angle + ((d - day) / 31) * TAU
    text(ctx, String(d), Math.cos(a) * r, Math.sin(a) * r, { size: 2.05, angle: a, font: SANS, weight: 650, spacing: -0.12 })
  }
  return finish(c)
}

/** Disque des jours (Day-Date) : 7 jours en toutes lettres, le jour courant à 12 h. */
export function makeDayTexture(names: string[], today: number, R: number, size = 1024, r = 11.55) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  ctx.fillStyle = '#f4f2ec'
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  ctx.fillStyle = '#0d0d0f'
  names.forEach((n, i) => {
    const a = Math.PI / 2 + ((i - today) / 7) * TAU
    text(ctx, n.toUpperCase(), Math.cos(a) * r, Math.sin(a) * r, { size: 1.55, angle: a - Math.PI / 2, font: SANS, weight: 700, spacing: 0.06 })
  })
  return finish(c)
}

/** Disque de phases de lune : deux lunes dorées sur un ciel étoilé. */
export function makeMoonTexture(R: number, orbit: number, size = 1024) {
  const { c, ctx } = canvas(size)
  worldCtx(ctx, size, R)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
  g.addColorStop(0, '#1d3270')
  g.addColorStop(1, '#0b1533')
  ctx.fillStyle = g
  ctx.fillRect(-R, -R, 2 * R, 2 * R)
  for (let i = 0; i < 160; i++) {
    const a = Math.random() * TAU
    const rr = Math.random() * R
    ctx.fillStyle = '#f2dc9a'
    ctx.globalAlpha = 0.4 + Math.random() * 0.6
    const s = 0.04 + Math.random() * 0.1
    ctx.beginPath()
    ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, s, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    const x = Math.cos(a) * orbit
    const y = Math.sin(a) * orbit
    const mg = ctx.createRadialGradient(x - 0.4, y + 0.4, 0.1, x, y, 1.55)
    mg.addColorStop(0, '#fff0bd')
    mg.addColorStop(1, '#c9a24f')
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, TAU)
    ctx.fill()
  }
  return finish(c)
}

/** Grain de cuir / caoutchouc / toile (bumpMap). */
export function makeStrapGrain(kind: 'leather' | 'rubber' | 'canvas', size = 512) {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  if (kind === 'leather') {
    // écailles d'alligator : cellules irrégulières
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const w = 18 + Math.random() * 30
      const h = 14 + Math.random() * 22
      ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.ellipse(x, y, w / 2, h / 2, Math.random() * 0.4, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
  } else if (kind === 'canvas') {
    for (let i = 0; i < size; i += 4) {
      ctx.fillStyle = i % 8 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
      ctx.fillRect(0, i, size, 2)
      ctx.fillRect(i, 0, 2, size)
    }
  } else {
    for (let i = 0; i < size; i += 16) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, i, size, 3)
    }
  }
  const t = finish(c, false, 4)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Perlage (graining circulaire) : bump + rugosité pour la platine. */
export function makePerlage(size = 512, cells = 12) {
  const { c, ctx } = canvas(size)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, size, size)
  const step = size / cells
  for (let y = -1; y <= cells; y++) {
    for (let x = -1; x <= cells; x++) {
      const cx = (x + (y % 2) * 0.5) * step
      const cy = y * step * 0.92
      const r = step * 0.68
      for (let k = 0; k < 14; k++) {
        const a0 = (k / 14) * TAU
        ctx.strokeStyle = k % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(cx, cy, r * (0.2 + (0.8 * ((k * 5) % 14)) / 14), a0, a0 + 1.6)
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
