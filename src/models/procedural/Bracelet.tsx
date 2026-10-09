import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BRACELETS, type BraceletId } from '../../data/watches'
import { DIM } from '../dims'
import { useDisposable } from '../../lib/useDisposable'
import type { WatchMaterials } from '../materials'
import { anim } from '../../store/useAtelier'
import { staggered } from '../../lib/explode'

/* ================================================================================
 * Trajet du bracelet : super-ellipse dans le plan YZ (le poignet), passant par
 * l'extrémité des cornes. Sa taille est calculée à partir du tour de poignet.
 * ================================================================================ */

const N = 2.25
const LUG_END_Y = 23.4
const LUG_END_Z = -0.1
/** Longueur occupée par la tête de montre entre les deux cornes. */
const HEAD_SPAN = 2 * LUG_END_Y

export interface Frame {
  pos: THREE.Vector3
  t: THREE.Vector3
  n: THREE.Vector3
}

export interface BraceletPath {
  length: number
  zc: number
  a: number
  b: number
  at: (dist: number) => Frame
}

function build(scale: number): BraceletPath {
  const A = 28 * scale
  const B = 24 * scale
  const se = (phi: number) => {
    const s = Math.sin(phi)
    const c = Math.cos(phi)
    const e = 2 / N
    return { y: A * Math.sign(s) * Math.pow(Math.abs(s), e), zr: B * Math.sign(c) * Math.pow(Math.abs(c), e) }
  }
  let lo = 0
  let hi = Math.PI / 2
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (se(mid).y < LUG_END_Y) lo = mid
    else hi = mid
  }
  const phi0 = (lo + hi) / 2
  const zc = LUG_END_Z - se(phi0).zr
  const samples: { s: number; p: THREE.Vector3 }[] = []
  const M = 1600
  let s = 0
  let prev: THREE.Vector3 | null = null
  for (let i = 0; i <= M; i++) {
    const phi = phi0 + ((Math.PI - phi0) * i) / M
    const { y, zr } = se(phi)
    const p = new THREE.Vector3(0, y, zc + zr)
    if (prev) s += p.distanceTo(prev)
    samples.push({ s, p })
    prev = p
  }
  const center = new THREE.Vector3(0, 0, zc)
  const at = (dist: number): Frame => {
    if (dist > s) {
      const f = at(s - 1e-3)
      f.pos.addScaledVector(f.t, dist - s)
      return f
    }
    let l = 0
    let h = samples.length - 1
    while (h - l > 1) {
      const mid = (l + h) >> 1
      if (samples[mid].s < dist) l = mid
      else h = mid
    }
    const a = samples[l]
    const b = samples[h]
    const k = (dist - a.s) / Math.max(b.s - a.s, 1e-6)
    const pos = a.p.clone().lerp(b.p, k)
    const t = b.p.clone().sub(a.p).normalize()
    // normale sortante (dans le plan YZ), orientée vers l'extérieur du poignet
    const n = new THREE.Vector3(0, t.z, -t.y)
    if (n.dot(pos.clone().sub(center)) < 0) n.negate()
    return { pos, t, n }
  }
  return { length: s, zc, a: A, b: B, at }
}

const cache = new Map<number, BraceletPath>()

/**
 * Trajet pour un tour de poignet donné (mm). La ligne médiane du bracelet mesure
 * environ le tour de poignet + π × épaisseur ; la tête de montre en occupe 47 mm.
 */
export function getPath(wrist: number): BraceletPath {
  const key = Math.round(wrist)
  const hit = cache.get(key)
  if (hit) return hit
  const target = (key + Math.PI * 3.2 - HEAD_SPAN) / 2
  let lo = 0.85
  let hi = 2.4
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if (build(mid).length < target) lo = mid
    else hi = mid
  }
  const p = build((lo + hi) / 2)
  cache.set(key, p)
  return p
}

/** Point le plus bas du bracelet (pour poser les ombres de contact). */
export const braceletBottom = (wrist: number) => -getPath(wrist).a - 3.5

export const CLASP_HALF = 15.5

/** Matrice d'instance à partir d'un repère (largeur X, tangente, normale). */
const tmpM = new THREE.Matrix4()
const X = new THREE.Vector3(1, 0, 0)
function frameMatrix(f: Frame, xOff: number, scaleX: number, out: THREE.Matrix4, lift = 0) {
  const z = f.n
  const y = new THREE.Vector3().crossVectors(z, X)
  tmpM.makeBasis(X, y, z)
  tmpM.scale(new THREE.Vector3(scaleX, 1, 1))
  const p = f.pos.clone().addScaledVector(X, xOff).addScaledVector(z, lift)
  tmpM.setPosition(p)
  out.copy(tmpM)
  return out
}

const mirror = (f: Frame, strand: number) => {
  if (strand < 0) {
    f.pos.y *= -1
    f.t.y *= -1
    f.n.y *= -1
  }
  return f
}

/* ----------------------------------- Maillons ----------------------------------- */

interface Piece {
  x: number
  w: number
  len: number
  h: number
  r: number
  offset: number
  kind: 'outer' | 'inner' | 'polish'
}

type MetalLayout = { pitch: number; taper: number; pieces: Piece[] }

const LAYOUTS: Record<'oyster' | 'jubilee' | 'president' | 'integrated', MetalLayout> = {
  oyster: {
    pitch: 7.6,
    taper: 0.16,
    pieces: [
      { x: -6.95, w: 6.05, len: 7.4, h: 3.4, r: 0.85, offset: 0, kind: 'outer' },
      { x: 6.95, w: 6.05, len: 7.4, h: 3.4, r: 0.85, offset: 0, kind: 'outer' },
      { x: 0, w: 7.75, len: 7.4, h: 3.1, r: 0.8, offset: 0, kind: 'inner' },
    ],
  },
  jubilee: {
    pitch: 5.2,
    taper: 0.16,
    pieces: [
      { x: -7.2, w: 5.4, len: 5.05, h: 3.1, r: 0.9, offset: 0, kind: 'outer' },
      { x: 7.2, w: 5.4, len: 5.05, h: 3.1, r: 0.9, offset: 0, kind: 'outer' },
      { x: -3.15, w: 2.45, len: 4.7, h: 2.8, r: 1.1, offset: 0.5, kind: 'polish' },
      { x: 3.15, w: 2.45, len: 4.7, h: 2.8, r: 1.1, offset: 0.5, kind: 'polish' },
      { x: 0, w: 3.5, len: 4.7, h: 2.85, r: 1.2, offset: 0, kind: 'inner' },
    ],
  },
  president: {
    pitch: 7.2,
    taper: 0.14,
    pieces: [
      { x: -7.1, w: 5.7, len: 7.0, h: 3.3, r: 1.55, offset: 0, kind: 'outer' },
      { x: 7.1, w: 5.7, len: 7.0, h: 3.3, r: 1.55, offset: 0, kind: 'outer' },
      { x: 0, w: 8.0, len: 7.0, h: 3.3, r: 1.55, offset: 0, kind: 'inner' },
    ],
  },
  integrated: {
    pitch: 7.0,
    taper: 0.24,
    pieces: [
      { x: -7.2, w: 5.6, len: 6.6, h: 3.6, r: 0.6, offset: 0, kind: 'outer' },
      { x: 7.2, w: 5.6, len: 6.6, h: 3.6, r: 0.6, offset: 0, kind: 'outer' },
      { x: 0, w: 5.2, len: 6.6, h: 3.4, r: 0.6, offset: 0, kind: 'inner' },
      { x: -3.3, w: 1.6, len: 3.0, h: 3.0, r: 0.5, offset: 0.5, kind: 'polish' },
      { x: 3.3, w: 1.6, len: 3.0, h: 3.0, r: 0.5, offset: 0.5, kind: 'polish' },
    ],
  },
}

interface Slot {
  dist: number
  strand: 1 | -1
  index: number
}

function MetalBracelet({
  m,
  type,
  twoTone,
  integrated,
  path,
}: {
  m: WatchMaterials
  type: keyof typeof LAYOUTS
  twoTone: boolean
  integrated: boolean
  path: BraceletPath
}) {
  const layout = LAYOUTS[type]
  const endLinkLen = 3.6
  const startDist = endLinkLen
  const usable = path.length - CLASP_HALF - startDist
  const rows = Math.max(2, Math.floor(usable / layout.pitch))
  const pitch = usable / rows

  const geos = useDisposable(() => layout.pieces.map((p) => new RoundedBoxGeometry(p.w, p.len, p.h, 3, p.r)), [type])
  const endGeo = useDisposable(() => new RoundedBoxGeometry(integrated ? 22.4 : DIM.braceletW - 0.4, endLinkLen, 3.6, 3, 0.9), [integrated])

  const slots = useMemo(() => {
    const perPiece: Slot[][] = layout.pieces.map(() => [])
    for (const strand of [1, -1] as const) {
      for (let i = 0; i < rows; i++) {
        layout.pieces.forEach((p, k) => {
          const d = startDist + (i + 0.5 + p.offset) * pitch
          if (d > path.length - CLASP_HALF + 0.5) return
          perPiece[k].push({ dist: d, strand, index: i })
        })
      }
    }
    return perPiece
  }, [layout, rows, pitch, startDist, path])

  const refs = useRef<(THREE.InstancedMesh | null)[]>([])
  const endRefs = useRef<(THREE.Group | null)[]>([])
  const lastE = useRef(-1)

  const update = (e: number) => {
    const M = new THREE.Matrix4()
    slots.forEach((list, k) => {
      const mesh = refs.current[k]
      if (!mesh) return
      const piece = layout.pieces[k]
      list.forEach((slot, i) => {
        // éclatement : les maillons s'espacent le long du trajet et s'écartent légèrement
        const spread = e * (1.0 + slot.index * 0.45)
        const f = mirror(path.at(slot.dist + spread), slot.strand)
        const taper = 1 - layout.taper * (slot.dist / path.length)
        frameMatrix(f, piece.x * taper, taper, M, piece.kind === 'outer' ? e * 1.4 : e * 3.2)
        // brin inférieur : décalage de l'éclatement (le groupe entier monte de +18 mm)
        if (slot.strand < 0) M.elements[13] -= 36 * e
        mesh.setMatrixAt(i, M)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    })
    endRefs.current.forEach((g, i) => {
      if (!g) return
      const sign = i === 0 ? 1 : -1
      g.position.set(0, sign * (LUG_END_Y - 0.2 + endLinkLen / 2 + e * 3) - (sign < 0 ? 36 * e : 0), LUG_END_Z - 0.2)
    })
  }

  useLayoutEffect(() => {
    lastE.current = -1
    update(0)
  })

  useFrame(() => {
    const e = staggered(anim.explode, 25)
    if (Math.abs(e - lastE.current) < 1e-4) return
    lastE.current = e
    update(e)
  })

  const matFor = (k: number) => {
    const p = layout.pieces[k]
    if (p.kind === 'polish') return twoTone ? m.accent : m.metal
    if (p.kind === 'inner') return twoTone ? m.accent : type === 'jubilee' || type === 'president' ? m.metal : m.metalBrushed
    return type === 'president' ? m.metal : m.metalBrushed
  }

  return (
    <group>
      {layout.pieces.map((_, k) => (
        <instancedMesh
          key={`${type}-${k}-${slots[k].length}-${path.length.toFixed(1)}`}
          ref={(el) => {
            refs.current[k] = el
          }}
          args={[geos[k], matFor(k), slots[k].length]}
          castShadow
          frustumCulled={false}
        />
      ))}
      {[0, 1].map((i) => (
        <group
          key={i}
          ref={(el) => {
            endRefs.current[i] = el
          }}
          rotation={[i === 0 ? -0.22 : 0.22, 0, 0]}
        >
          <mesh geometry={endGeo} material={m.metalBrushed} castShadow />
        </group>
      ))}
    </group>
  )
}

/* -------------------------------- Bracelets souples -------------------------------- */

/**
 * Bande balayée le long du trajet : section rectangulaire arrondie, largeur dégressive,
 * bord bombé (cuir rembourré) ou plat (caoutchouc, toile).
 */
function strapGeometry(path: BraceletPath, strand: 1 | -1, d0: number, d1: number, thick: number, padded: boolean, liftEnd = 0) {
  const SEG = Math.max(24, Math.round((d1 - d0) / 0.8))
  const RING = 14
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= SEG; i++) {
    const d = d0 + ((d1 - d0) * i) / SEG
    const f = mirror(path.at(d), strand)
    const w = 19.6 - 3.8 * Math.min(1, Math.max(0, (d - 4) / (path.length - 4)))
    // la bande supérieure se soulève en bout pour chevaucher l'autre brin
    const lift = liftEnd ? liftEnd * THREE.MathUtils.smoothstep(d, d1 - 22, d1 - 6) : 0
    for (let k = 0; k < RING; k++) {
      const a = (k / RING) * Math.PI * 2
      // super-ellipse : bords arrondis, dessus bombé si rembourré
      const cx = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.25)
      const sy = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.4)
      const x = (cx * w) / 2
      const bulge = padded && sy > 0 ? 1 - Math.pow(Math.abs(cx), 4) * 0.45 : 1
      const z = ((sy * thick) / 2) * bulge + lift
      const p = f.pos.clone().addScaledVector(X, x).addScaledVector(f.n, z)
      pos.push(p.x, p.y, p.z)
      uv.push(x, d)
    }
  }
  for (let i = 0; i < SEG; i++) {
    for (let k = 0; k < RING; k++) {
      const a = i * RING + k
      const b = i * RING + ((k + 1) % RING)
      const c = (i + 1) * RING + k
      const dd = (i + 1) * RING + ((k + 1) % RING)
      if (strand > 0) idx.push(a, c, b, b, c, dd)
      else idx.push(a, b, c, b, dd, c)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function StrapBracelet({ m, type, path }: { m: WatchMaterials; type: BraceletId; path: BraceletPath }) {
  const leather = type.startsWith('leather')
  const thick = leather ? 3.6 : type === 'canvas' ? 2.6 : 4.2
  const geos = useDisposable(() => {
    const top = strapGeometry(path, 1, -2.5, path.length + 18, thick, leather, thick + 0.4)
    const bottom = strapGeometry(path, -1, -2.5, path.length - 4, thick, leather)
    // surpiqûres : petits points le long des deux bords
    const stitches: THREE.Matrix4[] = []
    if (type !== 'rubber-black' && type !== 'rubber-blue') {
      for (const strand of [1, -1] as const) {
        const end = strand > 0 ? path.length + 8 : path.length - 6
        for (let d = 0; d < end; d += 1.7) {
          const f = mirror(path.at(d), strand)
          const w = 19.6 - 3.8 * Math.min(1, Math.max(0, (d - 4) / (path.length - 4)))
          for (const side of [-1, 1]) {
            const M = new THREE.Matrix4()
            frameMatrix(f, side * (w / 2 - 1.1), 1, M, thick / 2 + 0.02)
            stitches.push(M)
          }
        }
      }
    }
    const stitchGeo = new THREE.BoxGeometry(0.28, 1.0, 0.18)
    // passant (keeper) sur le brin inférieur
    const keeper = new RoundedBoxGeometry(18.4, 4.2, thick * 2 + 1.6, 3, 0.8)
    return { top, bottom, stitches, stitchGeo, keeper }
  }, [path, thick, leather, type])

  const stitchRef = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = stitchRef.current
    if (!mesh) return
    geos.stitches.forEach((M, i) => mesh.setMatrixAt(i, M))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [geos])

  const keeperM = useMemo(() => {
    const f = mirror(path.at(path.length - 14), -1)
    const M = new THREE.Matrix4()
    frameMatrix(f, 0, 0.86, M, thick * 0.5)
    return M
  }, [path, thick])
  const keeperRef = useRef<THREE.Mesh>(null)
  useLayoutEffect(() => {
    const k = keeperRef.current
    if (!k) return
    k.matrixAutoUpdate = false
    k.matrix.copy(keeperM)
  }, [keeperM])

  // éclatement : le brin inférieur descend (le groupe entier monte de +18 mm)
  const bottomRef = useRef<THREE.Group>(null)
  useFrame(() => {
    const e = staggered(anim.explode, 25)
    if (bottomRef.current) bottomRef.current.position.y = -36 * e
  })

  if (!m.strap) return null
  return (
    <group>
      <mesh geometry={geos.top} material={m.strap} castShadow />
      <group ref={bottomRef}>
        <mesh geometry={geos.bottom} material={m.strap} castShadow />
        <mesh ref={keeperRef} geometry={geos.keeper} material={m.strap} />
      </group>
      {geos.stitches.length > 0 && <instancedMesh ref={stitchRef} args={[geos.stitchGeo, m.stitch, geos.stitches.length]} frustumCulled={false} />}
    </group>
  )
}

export function Bracelet({
  m,
  type,
  twoTone,
  integrated,
  wrist,
}: {
  m: WatchMaterials
  type: BraceletId
  twoTone: boolean
  integrated: boolean
  wrist: number
}) {
  const path = getPath(wrist)
  if (BRACELETS[type].kind === 'strap') return <StrapBracelet m={m} type={type} path={path} />
  return <MetalBracelet m={m} type={type as keyof typeof LAYOUTS} twoTone={twoTone} integrated={integrated} path={path} />
}

/* ------------------------------ Fermoir / boucle ------------------------------ */

export function Clasp({ m, type, wrist }: { m: WatchMaterials; type: BraceletId; wrist: number }) {
  const path = getPath(wrist)
  const strap = BRACELETS[type].kind === 'strap'
  const thick = type.startsWith('leather') ? 3.6 : type === 'canvas' ? 2.6 : 4.2
  const geos = useDisposable(() => {
    if (strap) {
      // boucle ardillon : cadre posé sur la bande + ardillon
      const W = 19.5
      const H = 7
      const outer = new THREE.Shape()
      outer.moveTo(-W / 2, -H / 2)
      outer.lineTo(W / 2, -H / 2)
      outer.lineTo(W / 2, H / 2)
      outer.lineTo(-W / 2, H / 2)
      outer.closePath()
      const inner = new THREE.Path()
      inner.moveTo(-W / 2 + 1.6, -H / 2 + 1.6)
      inner.lineTo(-W / 2 + 1.6, H / 2 - 1.6)
      inner.lineTo(W / 2 - 1.6, H / 2 - 1.6)
      inner.lineTo(W / 2 - 1.6, -H / 2 + 1.6)
      inner.closePath()
      outer.holes.push(inner)
      const ring = new THREE.ExtrudeGeometry(outer, { depth: 1.2, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 3 })
      ring.translate(0, 0, -0.6)
      const tongue = new RoundedBoxGeometry(1.1, H - 0.6, 0.9, 2, 0.35).translate(0, 0, 0.9)
      return { base: ring, cover: tongue, lip: null as THREE.BufferGeometry | null }
    }
    const base = new RoundedBoxGeometry(16.6, CLASP_HALF * 2, 3.4, 4, 1.2)
    const cover = new RoundedBoxGeometry(13.6, CLASP_HALF * 2 - 4, 1.0, 3, 0.4).translate(0, -0.6, 2.0)
    const lip = new RoundedBoxGeometry(9, 2.2, 1.4, 3, 0.5).translate(0, -CLASP_HALF + 2.4, 2.3)
    return { base, cover, lip }
  }, [strap, thick])
  const matrix = useMemo(() => {
    const f = mirror(path.at(strap ? path.length - 4 : path.length - 0.001), strap ? -1 : 1)
    const M = new THREE.Matrix4()
    frameMatrix(f, 0, 1, M, strap ? thick * 0.55 : -0.2)
    return M
  }, [path, strap, thick])
  const group = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    if (!group.current) return
    group.current.matrixAutoUpdate = false
    group.current.matrix.copy(matrix)
  }, [matrix])
  return (
    <group ref={group}>
      <mesh geometry={geos.base} material={strap ? m.metal : m.metalBrushed} castShadow />
      <mesh geometry={geos.cover} material={m.metal} />
      {geos.lip && <mesh geometry={geos.lip} material={m.metal} />}
    </group>
  )
}
