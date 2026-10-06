/**
 * Scrollytelling : poses caméra et états de la montre en fonction de la progression du scroll (0..1).
 * Chaque clé correspond à une section de la landing.
 */
type V3 = [number, number, number]
interface Key {
  at: number
  pos: V3
  target: V3
  /** Décalage écran (unités monde) pour laisser la place au texte. */
  focal: V3
  focalMobile: V3
  explode: number
  movement: number
}

export const LANDING_KEYS: Key[] = [
  // Hero
  { at: 0.0, pos: [40, 12, 128], target: [0, 0, -4], focal: [-24, 0, 0], focalMobile: [0, -16, 0], explode: 0, movement: 0 },
  // Le boîtier : profil côté couronne
  { at: 0.2, pos: [112, 22, 62], target: [4, 0, -6], focal: [26, 0, 0], focalMobile: [0, -18, 0], explode: 0, movement: 0 },
  // Vue éclatée
  { at: 0.42, pos: [200, 70, 120], target: [0, 0, -8], focal: [-40, 0, 0], focalMobile: [0, -30, 0], explode: 1, movement: 0 },
  { at: 0.56, pos: [210, 40, -30], target: [0, 0, -10], focal: [-40, 0, 0], focalMobile: [0, -30, 0], explode: 1, movement: 0 },
  // Le mouvement, vu par le fond
  { at: 0.74, pos: [-46, 18, -104], target: [0, 0, -2], focal: [22, 0, 0], focalMobile: [0, -14, 0], explode: 0, movement: 1 },
  // Collection
  { at: 1.0, pos: [0, 6, 150], target: [0, 0, -4], focal: [0, 12, 0], focalMobile: [0, -6, 0], explode: 0, movement: 0 },
]

const ease = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

export function landingPose(p: number, narrow: boolean) {
  const keys = LANDING_KEYS
  let i = 0
  while (i < keys.length - 2 && p > keys[i + 1].at) i++
  const a = keys[i]
  const b = keys[i + 1]
  const t = ease(Math.min(Math.max((p - a.at) / (b.at - a.at), 0), 1))
  const k = narrow ? 1.55 : 1
  const pos = lerp3(a.pos, b.pos, t).map((v) => v * k) as V3
  return {
    pos,
    target: lerp3(a.target, b.target, t),
    focal: narrow ? lerp3(a.focalMobile, b.focalMobile, t) : lerp3(a.focal, b.focal, t),
    explode: lerp(a.explode, b.explode, t),
    movement: lerp(a.movement, b.movement, t),
  }
}
