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

/** Recul de la caméra sur écran étroit (la montre occupe le haut, le texte le bas). */
export const MOBILE_DISTANCE = 1.8

export const LANDING_KEYS: Key[] = [
  // Hero
  { at: 0.0, pos: [40, 12, 128], target: [0, 0, -4], focal: [-24, 0, 0], focalMobile: [0, 31, 0], explode: 0, movement: 0 },
  // Le boîtier : profil côté couronne
  { at: 0.2, pos: [112, 22, 62], target: [4, 0, -6], focal: [26, 0, 0], focalMobile: [0, 22, 0], explode: 0, movement: 0 },
  // Vue éclatée
  { at: 0.42, pos: [190, 80, 175], target: [0, 0, -8], focal: [-46, 0, 0], focalMobile: [0, 34, 0], explode: 1, movement: 0 },
  { at: 0.56, pos: [250, 60, -40], target: [0, 0, -10], focal: [-48, 0, 0], focalMobile: [0, 34, 0], explode: 1, movement: 0 },
  // Le mouvement, vu par le fond
  { at: 0.74, pos: [-58, 24, -138], target: [0, 0, -2], focal: [26, 0, 0], focalMobile: [0, 24, 0], explode: 0, movement: 1 },
  // Collection
  { at: 1.0, pos: [0, 8, 200], target: [0, 0, -4], focal: [0, 30, 0], focalMobile: [0, 46, 0], explode: 0, movement: 0 },
]

/**
 * Recale les clés sur la position réelle des sections (appelé par la landing au resize).
 * `anchors` : progression de scroll (0..1) correspondant à chaque clé.
 */
export function setLandingAnchors(anchors: number[]) {
  anchors.forEach((a, i) => {
    if (LANDING_KEYS[i]) LANDING_KEYS[i].at = a
  })
  for (let i = 1; i < LANDING_KEYS.length; i++) LANDING_KEYS[i].at = Math.max(LANDING_KEYS[i].at, LANDING_KEYS[i - 1].at + 1e-3)
}

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
  const k = narrow ? MOBILE_DISTANCE : 1
  const pos = lerp3(a.pos, b.pos, t).map((v) => v * k) as V3
  return {
    pos,
    target: lerp3(a.target, b.target, t),
    focal: narrow ? lerp3(a.focalMobile, b.focalMobile, t) : lerp3(a.focal, b.focal, t),
    explode: lerp(a.explode, b.explode, t),
    movement: lerp(a.movement, b.movement, t),
  }
}
