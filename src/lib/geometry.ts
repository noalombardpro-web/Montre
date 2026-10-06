import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type P2 = [number, number]
const TAU = Math.PI * 2

/**
 * Arrondit les angles d'un profil 2D (rayon r, hauteur z) par des congés circulaires.
 * `radii` peut être un nombre ou un tableau (un rayon par sommet ; 0 = angle vif).
 */
export function roundProfile(pts: P2[], radii: number | number[], segs = 5): P2[] {
  const out: P2[] = []
  for (let i = 0; i < pts.length; i++) {
    const r = Array.isArray(radii) ? radii[i] ?? 0 : radii
    const p = pts[i]
    if (i === 0 || i === pts.length - 1 || r <= 0) {
      out.push(p)
      continue
    }
    const a = pts[i - 1]
    const b = pts[i + 1]
    const v1: P2 = [a[0] - p[0], a[1] - p[1]]
    const v2: P2 = [b[0] - p[0], b[1] - p[1]]
    const l1 = Math.hypot(...v1)
    const l2 = Math.hypot(...v2)
    const rr = Math.min(r, l1 * 0.45, l2 * 0.45)
    const s: P2 = [p[0] + (v1[0] / l1) * rr, p[1] + (v1[1] / l1) * rr]
    const e: P2 = [p[0] + (v2[0] / l2) * rr, p[1] + (v2[1] / l2) * rr]
    // Bézier quadratique s -> p -> e : approximation douce du congé.
    for (let k = 0; k <= segs; k++) {
      const t = k / segs
      const u = 1 - t
      out.push([u * u * s[0] + 2 * u * t * p[0] + t * t * e[0], u * u * s[1] + 2 * u * t * p[1] + t * t * e[1]])
    }
  }
  return out
}

/** Surface de révolution autour de l'axe Z, à partir d'un profil [rayon, z]. */
export function lathe(profile: P2[], segments = 128, phiStart = 0, phiLength = TAU) {
  const g = new THREE.LatheGeometry(
    profile.map(([r, z]) => new THREE.Vector2(Math.max(r, 0), z)),
    segments,
    phiStart,
    phiLength,
  )
  g.rotateX(Math.PI / 2)
  return g
}

/**
 * Révolution modulée : `fn(theta, r, z)` renvoie un décalage [dr, dz] appliqué à chaque sommet.
 * Sert aux lunettes cannelées / crantées, couronnes et fonds vissés.
 */
export function modulatedLathe(
  profile: P2[],
  segments: number,
  fn: (theta: number, r: number, z: number) => [number, number],
) {
  const g = lathe(profile, segments)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, y)
    const th = Math.atan2(y, x)
    const [dr, dz] = fn(th, r, z)
    const nr = r + dr
    if (r > 1e-6) {
      pos.setXYZ(i, (x / r) * nr, (y / r) * nr, z + dz)
    } else pos.setZ(i, z + dz)
  }
  g.computeVertexNormals()
  return g
}

/** Extrusion d'une forme 2D dans le plan XY, de z0 à z0+depth. */
export function extrudeZ(
  shape: THREE.Shape | THREE.Shape[],
  depth: number,
  z0 = 0,
  bevel = 0,
  curveSegments = 24,
) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - bevel * 2, 0.001),
    curveSegments,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: bevel > 0 ? 3 : 0,
  })
  g.translate(0, 0, z0 + bevel)
  return g
}

export function circlePath(r: number, cx = 0, cy = 0, cw = false) {
  const p = new THREE.Path()
  p.absarc(cx, cy, r, 0, TAU, cw)
  return p
}

export function circleShape(r: number, cx = 0, cy = 0) {
  const s = new THREE.Shape()
  s.absarc(cx, cy, r, 0, TAU, false)
  return s
}

export function annulusShape(rOut: number, rIn: number) {
  const s = circleShape(rOut)
  s.holes.push(circlePath(rIn, 0, 0, true))
  return s
}

/**
 * Roue dentée horlogère : denture à profil arrondi + bras (croisillons) évidés.
 */
export function gearShape(opts: {
  teeth: number
  r: number
  toothDepth?: number
  spokes?: number
  rim?: number
  hub?: number
  hole?: number
  spokeWidth?: number
}) {
  const { teeth, r, spokes = 4, hole = 0.25 } = opts
  const depth = opts.toothDepth ?? Math.min(0.5, (TAU * r) / teeth) * 0.9
  const rim = opts.rim ?? Math.max(0.35, r * 0.12)
  const hub = opts.hub ?? Math.max(0.45, r * 0.18)
  const sw = opts.spokeWidth ?? Math.max(0.22, r * 0.09)
  const root = r - depth
  const s = new THREE.Shape()
  const step = TAU / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts: [number, number][] = [
      [root, a],
      [root, a + step * 0.12],
      [r - depth * 0.25, a + step * 0.2],
      [r, a + step * 0.3],
      [r, a + step * 0.42],
      [r - depth * 0.25, a + step * 0.52],
      [root, a + step * 0.6],
    ]
    pts.forEach(([rr, aa], k) => {
      const x = Math.cos(aa) * rr
      const y = Math.sin(aa) * rr
      if (i === 0 && k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
  }
  s.closePath()
  if (spokes > 0 && root - rim > hub + 0.3) {
    const rIn = root - rim
    for (let k = 0; k < spokes; k++) {
      const a0 = (k / spokes) * TAU
      const a1 = ((k + 1) / spokes) * TAU
      const dIn = sw / 2 / (hub + 0.15)
      const dOut = sw / 2 / rIn
      const h = new THREE.Path()
      h.moveTo(Math.cos(a0 + dIn) * (hub + 0.15), Math.sin(a0 + dIn) * (hub + 0.15))
      h.absarc(0, 0, rIn, a0 + dOut, a1 - dOut, false)
      h.absarc(0, 0, hub + 0.15, a1 - dIn, a0 + dIn, true)
      s.holes.push(h)
    }
  }
  if (hole > 0) s.holes.push(circlePath(hole, 0, 0, true))
  return s
}

/** Roue d'échappement à dents en « club » (15 dents). */
export function escapeWheelShape(r: number, teeth = 15) {
  const s = new THREE.Shape()
  const step = TAU / teeth
  const root = r * 0.72
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const p = (rr: number, aa: number) => [Math.cos(aa) * rr, Math.sin(aa) * rr] as const
    const pts = [p(root, a), p(r * 0.98, a + step * 0.42), p(r, a + step * 0.5), p(r * 0.93, a + step * 0.62), p(root, a + step * 0.66)]
    pts.forEach(([x, y], k) => (i === 0 && k === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  }
  s.closePath()
  const rIn = root - 0.3
  for (let k = 0; k < 4; k++) {
    const a0 = (k / 4) * TAU + 0.18
    const a1 = ((k + 1) / 4) * TAU - 0.18
    const h = new THREE.Path()
    h.absarc(0, 0, rIn, a0, a1, false)
    h.absarc(0, 0, 0.75, a1 - 0.25, a0 + 0.25, true)
    s.holes.push(h)
  }
  s.holes.push(circlePath(0.18, 0, 0, true))
  return s
}

/** Forme « stade » (segment arrondi) entre deux points. */
export function stadium(ax: number, ay: number, bx: number, by: number, r: number) {
  const s = new THREE.Shape()
  const ang = Math.atan2(by - ay, bx - ax)
  s.absarc(bx, by, r, ang - Math.PI / 2, ang + Math.PI / 2, false)
  s.absarc(ax, ay, r, ang + Math.PI / 2, ang + (Math.PI * 3) / 2, false)
  s.closePath()
  return s
}

/** Contour lisse passant par une liste de points (spline fermée Catmull-Rom). */
export function smoothShape(points: P2[], holes: THREE.Path[] = [], divisions = 120) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    true,
    'centripetal',
  )
  const s = new THREE.Shape(curve.getSpacedPoints(divisions).map((v) => new THREE.Vector2(v.x, v.y)))
  s.holes.push(...holes)
  return s
}

/** UV planaires centrées : (x,y) ∈ [-R,R] -> [0,1]. */
export function planarUV(g: THREE.BufferGeometry, R: number, cx = 0, cy = 0) {
  const pos = g.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - cx + R) / (2 * R)
    uv[i * 2 + 1] = (pos.getY(i) - cy + R) / (2 * R)
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return g
}

export function merge(geos: THREE.BufferGeometry[]) {
  const norm = geos.map((g) => {
    const n = g.index ? g.toNonIndexed() : g
    for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k)
    if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2))
    if (!n.attributes.normal) n.computeVertexNormals()
    return n
  })
  return mergeGeometries(norm, false)!
}

/** Positionne une géométrie : rotation Z puis translation. */
export function place(g: THREE.BufferGeometry, x: number, y: number, z = 0, rotZ = 0) {
  if (rotZ) g.rotateZ(rotZ)
  g.translate(x, y, z)
  return g
}

export const deg = (d: number) => (d * Math.PI) / 180
