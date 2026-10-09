import * as THREE from 'three'
import { DIM } from '../dims'
import { deg, extrudeZ, lathe, merge, modulatedLathe, roundProfile, smoothShape, type P2 } from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { WatchMaterials } from '../materials'

/** Matrice (u, v, d) -> (x = d, y = u, z = v) : extrusion d'un profil latéral. */
const SIDE = new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1)

function lugGeometry(integrated: boolean) {
  if (integrated) {
    // épaulement large qui prolonge le boîtier jusqu'au bracelet (montres à bracelet intégré)
    const profile: P2[] = [
      [13.5, -2.4],
      [19.5, -2.3],
      [22.6, -1.6],
      [23.2, 0.2],
      [22.4, 1.9],
      [19.4, 3.2],
      [13.5, 4.3],
    ]
    const one = extrudeZ(smoothShape(profile, [], 90), 22.6, 0, 0.5, 12)
    one.applyMatrix4(SIDE)
    one.translate(-11.3, 0, 0)
    return merge([one, one.clone().rotateZ(Math.PI)])
  }
  const profile: P2[] = [
    [14.2, -2.3],
    [19.2, -2.2],
    [22.8, -1.85],
    [24.3, -1.2],
    [24.75, 0.1],
    [24.2, 1.45],
    [22.4, 2.45],
    [19.4, 3.7],
    [14.2, 4.4],
  ]
  const shape = smoothShape(profile, [], 90)
  const one = extrudeZ(shape, DIM.lugW, 0, 0.32, 12)
  one.applyMatrix4(SIDE)
  const a = one.clone().translate(DIM.lugX - DIM.lugW / 2, 0, 0)
  const b = one.clone().translate(-DIM.lugX - DIM.lugW / 2, 0, 0)
  const top = merge([a, b])
  const bottom = top.clone().rotateZ(Math.PI)
  return merge([top, bottom])
}

function crownGuardGeometry() {
  const pts: P2[] = [
    [19.0, 2.2],
    [21.4, 2.9],
    [22.35, 4.2],
    [21.6, 6.2],
    [19.2, 7.6],
    [18.4, 5.0],
  ]
  const up = extrudeZ(smoothShape(pts, [], 60), 4.2, -1.3, 0.45, 12)
  const down = extrudeZ(
    smoothShape(pts.map(([x, y]) => [x, -y] as P2), [], 60),
    4.2,
    -1.3,
    0.45,
    12,
  )
  return merge([up, down])
}

export function CaseMiddle({ m, guards, integrated = false }: { m: WatchMaterials; guards: boolean; integrated?: boolean }) {
  const geos = useDisposable(() => {
    const profile = roundProfile(
      [
        [DIM.innerR - 0.2, DIM.caseZ0],
        [18.2, DIM.caseZ0],
        [19.6, -2.0],
        [DIM.caseR, -0.9],
        [DIM.caseR, 3.1],
        [19.5, 4.25],
        [18.8, DIM.caseZ1],
        [DIM.innerR + 0.1, DIM.caseZ1],
        [DIM.innerR - 0.2, 3.8],
        [DIM.innerR - 0.2, DIM.caseZ0],
      ],
      [0, 0.5, 0.8, 1.0, 1.0, 0.8, 0.5, 0.2, 0.2, 0],
      6,
    )
    const middle = lathe(profile, 160)
    const lugs = lugGeometry(integrated)
    const guard = guards ? crownGuardGeometry() : null
    // Rehaut (anneau intérieur incliné entre cadran et verre)
    const flange = lathe(
      [
        [DIM.dialR - 0.4, DIM.dialZ + 0.02],
        [DIM.innerR - 0.15, DIM.crystalZ0 - 0.05],
        [DIM.innerR - 0.1, DIM.crystalZ0 - 0.05],
        [DIM.innerR - 0.1, DIM.dialZ],
      ],
      128,
    )
    return { middle, lugs, guard, flange }
  }, [guards, integrated])
  return (
    <group>
      <mesh geometry={geos.middle} material={m.metal} castShadow />
      <mesh geometry={geos.lugs} material={m.metalBrushed} castShadow />
      {geos.guard && <mesh geometry={geos.guard} material={m.metal} />}
      <mesh geometry={geos.flange} material={m.metalBrushed} />
    </group>
  )
}

/** Couronne cannelée (axe X), réutilisée pour les poussoirs. */
function crownGeometry(r: number, len: number, flutes: number) {
  const p = roundProfile(
    [
      [0, 0],
      [r * 0.62, 0],
      [r * 0.62, len * 0.18],
      [r * 0.97, len * 0.24],
      [r, len * 0.36],
      [r, len * 0.86],
      [r * 0.9, len],
      [0, len + 0.05],
    ],
    [0, 0, 0.1, 0.25, 0.2, 0.25, 0.3, 0],
    4,
  )
  const g = modulatedLathe(p, flutes * 6, (th, rr, z) => {
    if (rr < r * 0.93 || z < len * 0.3 || z > len * 0.9) return [0, 0]
    const f = 0.5 + 0.5 * Math.cos(th * flutes)
    return [-0.16 * Math.pow(f, 2) * (r / 3.2), 0]
  })
  g.rotateY(Math.PI / 2)
  return g
}

export function Crown({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const crown = crownGeometry(3.2, 3.6, 22)
    crown.translate(DIM.caseR + 0.15, 0, 0.9)
    const tube = new THREE.CylinderGeometry(1.25, 1.25, 1.2, 32).rotateZ(Math.PI / 2).translate(DIM.caseR - 0.2, 0, 0.9)
    return { crown, tube }
  }, [])
  return (
    <group>
      <mesh geometry={geos.crown} material={m.accent} castShadow />
      <mesh geometry={geos.tube} material={m.metal} />
    </group>
  )
}

export function Pushers({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const a of [deg(32), deg(-32)]) {
      const collar = crownGeometry(1.95, 1.7, 18)
      collar.translate(DIM.caseR - 0.6, 0, 0.9)
      const button = new THREE.CylinderGeometry(1.15, 1.15, 2.6, 32).rotateZ(Math.PI / 2).translate(DIM.caseR + 1.9, 0, 0.9)
      const cap = new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.35, 1)
        .rotateZ(-Math.PI / 2)
        .translate(DIM.caseR + 3.2, 0, 0.9)
      for (const g of [collar, button, cap]) {
        g.rotateZ(a)
        parts.push(g)
      }
    }
    return merge(parts)
  }, [])
  return <mesh geometry={geo} material={m.metal} castShadow />
}

export function Caseback({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const p = roundProfile(
      [
        [0, -4.55],
        [10, -4.5],
        [16.4, -4.2],
        [17.9, -3.6],
        [18.2, -2.62],
        [0, -2.62],
      ],
      [0, 0, 1.5, 0.6, 0.2, 0],
      6,
    )
    return modulatedLathe(p, 36 * 8, (th, r, z) => {
      if (r < 16.8 || z > -2.9) return [0, 0]
      const f = 0.5 + 0.5 * Math.cos(th * 36)
      return [-0.42 * Math.pow(f, 3), 0]
    })
  }, [])
  return <mesh geometry={geo} material={m.metal} />
}
