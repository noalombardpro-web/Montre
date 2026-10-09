import type { WatchStyle } from '../data/watches'

const TAU = Math.PI * 2

export type SubdialKind = 'sec' | 'chronoMin' | 'chronoHour'
export interface Subdial {
  x: number
  y: number
  r: number
  kind: SubdialKind
}

/**
 * Disposition du cadran, partagée par la texture (impressions) et la géométrie
 * (guichets, index, aiguilles auxiliaires) pour qu'elles coïncident exactement.
 */
export interface DialLayout {
  subdials: Subdial[]
  /** Guichet de date : angle trigonométrique (0 = 3 h) et rayon du centre. */
  date: { angle: number; r: number } | null
  day: boolean
  moon: { x: number; y: number; r: number; discY: number } | null
  /** Heures (0..11) sans index appliqué. */
  skipHours: Set<number>
  /** Ordonnées des impressions haut / bas. */
  topY: number
  bottomY: number
}

export const DATE_WIN = { w: 3.3, h: 2.6 }
export const DAY_WIN = { w: 7.2, h: 2.5, y: 11.55 }

export function dialLayout(s: WatchStyle): DialLayout {
  const subdials: Subdial[] = []
  if (s.chrono === 'tri') {
    subdials.push({ x: 7.4, y: 0, r: 3.55, kind: 'chronoMin' }, { x: 0, y: -7.4, r: 3.55, kind: 'chronoHour' }, { x: -7.4, y: 0, r: 3.55, kind: 'sec' })
  } else if (s.chrono === 'vertical') {
    subdials.push({ x: 0, y: 6.9, r: 3.7, kind: 'chronoMin' }, { x: 0, y: -6.9, r: 3.7, kind: 'sec' })
  } else if (s.smallSeconds) {
    subdials.push({ x: 0, y: -7.3, r: 3.6, kind: 'sec' })
  }
  const date = s.date ? { angle: s.chrono ? -Math.PI / 4 : 0, r: 11.8 } : null
  const moon = s.moonphase ? { x: 0, y: -7.6, r: 2.8, discY: -11.2 } : null
  const skipHours = new Set<number>()
  if (date && date.angle === 0) skipHours.add(3)
  if (s.day) skipHours.add(0)
  const somethingAt6 = subdials.some((d) => d.y < -5 && Math.abs(d.x) < 1) || !!moon
  const somethingAt12 = s.day || subdials.some((d) => d.y > 5 && Math.abs(d.x) < 1)
  return {
    subdials,
    date,
    day: !!s.day,
    moon,
    skipHours,
    topY: somethingAt12 ? 2.6 : s.chrono === 'tri' ? 9.4 : 7.3,
    bottomY: s.chrono === 'tri' ? -11.4 : somethingAt6 ? -2.6 : -5.4,
  }
}

/** Position (x, y) d'un repère horaire au rayon r. */
export const hourPos = (h: number, r: number) => {
  const a = Math.PI / 2 - (h / 12) * TAU
  return [Math.cos(a) * r, Math.sin(a) * r] as const
}

/** Un chiffre imprimé à l'heure h entrerait-il en collision avec une complication ? */
export function numeralBlocked(l: DialLayout, h: number, r: number) {
  if (l.skipHours.has(h)) return true
  const [x, y] = hourPos(h, r)
  if (l.subdials.some((d) => Math.hypot(d.x - x, d.y - y) < d.r + 1.4)) return true
  if (l.date) {
    const dx = Math.cos(l.date.angle) * l.date.r
    const dy = Math.sin(l.date.angle) * l.date.r
    if (Math.hypot(dx - x, dy - y) < 3.2) return true
  }
  if (l.moon && Math.hypot(l.moon.x - x, l.moon.y - y) < l.moon.r + 1.6) return true
  if (l.day && h === 0) return true
  return false
}
