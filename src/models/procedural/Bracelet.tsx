import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { BraceletId } from '../../data/watches'
import { DIM } from '../dims'
import { useDisposable } from '../../lib/useDisposable'
import type { WatchMaterials } from '../materials'
import { anim } from '../../store/useAtelier'
import { staggered } from '../../lib/explode'

/**
 * Trajet du bracelet : super-ellipse dans le plan YZ (le poignet), passant par l'extrémité des cornes.
 */
const A = 28
const B = 24
const N = 2.25
const LUG_END_Y = 23.4
const LUG_END_Z = -0.1

function se(phi: number) {
  const s = Math.sin(phi)
  const c = Math.cos(phi)
  const e = 2 / N
  return { y: A * Math.sign(s) * Math.pow(Math.abs(s), e), zr: B * Math.sign(c) * Math.pow(Math.abs(c), e) }
}

function solvePhi0() {
  let lo = 0
  let hi = Math.PI / 2
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (se(mid).y < LUG_END_Y) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export const PHI0 = solvePhi0()
export const ZC = LUG_END_Z - se(PHI0).zr

export interface Frame {
  pos: THREE.Vector3
  t: THREE.Vector3
  n: THREE.Vector3
}

/** Échantillonnage par abscisse curviligne du brin supérieur (de la corne au fermoir). */
function buildPath() {
  const samples: { phi: number; s: number; p: THREE.Vector3 }[] = []
  const M = 2000
  let s = 0
  let prev: THREE.Vector3 | null = null
  for (let i = 0; i <= M; i++) {
    const phi = PHI0 + ((Math.PI - PHI0) * i) / M
    const { y, zr } = se(phi)
    const p = new THREE.Vector3(0, y, ZC + zr)
    if (prev) s += p.distanceTo(prev)
    samples.push({ phi, s, p })
    prev = p
  }
  const at = (dist: number): Frame => {
    if (dist > s) {
      const f = at(s - 1e-3)
      f.pos.addScaledVector(f.t, dist - s)
      return f
    }
    let lo = 0
    let hi = samples.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (samples[mid].s < dist) lo = mid
      else hi = mid
    }
    const a = samples[lo]
    const b = samples[hi]
    const k = (dist - a.s) / Math.max(b.s - a.s, 1e-6)
    const pos = a.p.clone().lerp(b.p, k)
    const t = b.p.clone().sub(a.p).normalize()
    // normale sortante (dans le plan YZ), orientée vers l'extérieur du poignet
    const n = new THREE.Vector3(0, t.z, -t.y)
    if (n.dot(pos.clone().sub(new THREE.Vector3(0, 0, ZC))) < 0) n.negate()
    return { pos, t, n }
  }
  return { length: s, at }
}

export const PATH = buildPath()
export const CLASP_HALF = 14.5

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

interface Piece {
  x: number
  w: number
  len: number
  h: number
  r: number
  offset: number
  kind: 'outer' | 'inner'
}

const LAYOUTS: Record<BraceletId, { pitch: number; pieces: Piece[] }> = {
  oyster: {
    pitch: 6.7,
    pieces: [
      { x: -6.95, w: 6.05, len: 6.55, h: 2.7, r: 0.75, offset: 0, kind: 'outer' },
      { x: 6.95, w: 6.05, len: 6.55, h: 2.7, r: 0.75, offset: 0, kind: 'outer' },
      { x: 0, w: 7.75, len: 6.55, h: 2.45, r: 0.7, offset: 0, kind: 'inner' },
    ],
  },
  jubilee: {
    pitch: 4.7,
    pieces: [
      { x: -7.2, w: 5.4, len: 4.55, h: 2.5, r: 0.8, offset: 0, kind: 'outer' },
      { x: 7.2, w: 5.4, len: 4.55, h: 2.5, r: 0.8, offset: 0, kind: 'outer' },
      { x: -3.15, w: 2.45, len: 4.2, h: 2.2, r: 1.0, offset: 0.5, kind: 'inner' },
      { x: 3.15, w: 2.45, len: 4.2, h: 2.2, r: 1.0, offset: 0.5, kind: 'inner' },
      { x: 0, w: 3.5, len: 4.2, h: 2.25, r: 1.1, offset: 0, kind: 'inner' },
    ],
  },
}

interface Slot {
  dist: number
  strand: 1 | -1
  index: number
  piece: number
}

export function Bracelet({ m, type, twoTone }: { m: WatchMaterials; type: BraceletId; twoTone: boolean }) {
  const layout = LAYOUTS[type]
  const endLinkLen = 3.4
  const startDist = endLinkLen
  const usable = PATH.length - CLASP_HALF - startDist
  const rows = Math.floor(usable / layout.pitch)
  const pitch = usable / rows

  const geos = useDisposable(
    () => layout.pieces.map((p) => new RoundedBoxGeometry(p.w, p.len, p.h, 3, p.r)),
    [type],
  )
  const endGeo = useDisposable(() => {
    const g = new RoundedBoxGeometry(DIM.braceletW - 0.4, endLinkLen, 3.2, 3, 0.9)
    return g
  }, [])

  const slots = useMemo(() => {
    const perPiece: Slot[][] = layout.pieces.map(() => [])
    for (const strand of [1, -1] as const) {
      for (let i = 0; i < rows; i++) {
        layout.pieces.forEach((p, k) => {
          const d = startDist + (i + 0.5 + p.offset) * pitch
          if (d > PATH.length - CLASP_HALF + 0.5) return
          perPiece[k].push({ dist: d, strand, index: i, piece: k })
        })
      }
    }
    return perPiece
  }, [layout, rows, pitch, startDist])

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
        const f = PATH.at(Math.min(slot.dist + spread, PATH.length + 40))
        if (slot.strand < 0) {
          f.pos.y *= -1
          f.t.y *= -1
          f.n.y *= -1
        }
        const taper = 1 - 0.16 * (slot.dist / PATH.length)
        frameMatrix(f, piece.x * taper, taper, M, piece.kind === 'outer' ? e * 1.4 : e * 3.2)
        // brin inférieur : décalage de l'éclatement (le groupe entier monte de +24 mm)
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
    if (p.kind === 'inner') return twoTone ? m.accent : type === 'jubilee' ? m.metal : m.metalBrushed
    return m.metalBrushed
  }

  return (
    <group>
      {layout.pieces.map((_, k) => (
        <instancedMesh
          key={`${type}-${k}-${slots[k].length}`}
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

export function Clasp({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const base = new RoundedBoxGeometry(16.6, CLASP_HALF * 2, 3.0, 4, 1.1)
    const cover = new RoundedBoxGeometry(13.6, CLASP_HALF * 2 - 4, 0.9, 3, 0.4).translate(0, -0.6, 1.75)
    const lip = new RoundedBoxGeometry(9, 2.2, 1.4, 3, 0.5).translate(0, -CLASP_HALF + 2.4, 2.0)
    return { base, cover, lip }
  }, [])
  const matrix = useMemo(() => {
    const f = PATH.at(PATH.length - 0.001)
    const M = new THREE.Matrix4()
    frameMatrix(f, 0, 1, M, -0.2)
    return M
  }, [])
  const group = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    if (!group.current) return
    group.current.matrixAutoUpdate = false
    group.current.matrix.copy(matrix)
  }, [matrix])
  return (
    <group ref={group}>
      <mesh geometry={geos.base} material={m.metalBrushed} castShadow />
      <mesh geometry={geos.cover} material={m.metal} />
      <mesh geometry={geos.lip} material={m.metal} />
    </group>
  )
}
