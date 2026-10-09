import * as THREE from 'three'
import { DIM } from '../dims'
import { lathe, merge, modulatedLathe, planarUV, roundProfile, type P2 } from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { BezelOption, BezelStyle } from '../../data/watches'
import type { WatchMaterials } from '../materials'

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

/** Facteur polygonal : 1 aux sommets, cos(π/n) au milieu des pans ; `soft` adoucit les angles. */
function polygonFactor(theta: number, n: number, soft: number) {
  const seg = TAU / n
  const phi = ((((theta + seg / 2) % seg) + seg) % seg) - seg / 2
  const f = Math.cos(Math.PI / n) / Math.cos(phi)
  return 1 - (1 - f) * (1 - soft)
}

const TAU = Math.PI * 2

function bezelRing(style: BezelStyle) {
  const { bezelRin: ri, bezelR: ro, bezelZ0: z0, bezelZ1: z1 } = DIM
  if (style === 'fluted' || style === 'smooth' || style === 'coin') {
    const p = roundProfile(
      [
        [ri, z0],
        [ro, z0],
        [ro + 0.05, z0 + 0.7],
        [19.3, z1 - 0.55],
        [17.9, z1],
        [16.3, z1 - 0.05],
        [ri, z1 - 0.45],
        [ri, z0],
      ],
      [0, 0.15, 0.5, 1.2, 1.4, 0.6, 0.2, 0],
      8,
    )
    if (style === 'smooth') return lathe(p, 200)
    if (style === 'coin') {
      // Clous de Paris : pyramides en quadrillage sur le flanc incliné
      const N = 96
      return modulatedLathe(p, N * 8, (th, r, z) => {
        const w = smoothstep(16.6, 17.4, r) * smoothstep(z0 + 0.4, z0 + 1.0, z)
        if (w <= 0) return [0, 0]
        const a = Math.abs(Math.cos((th * N) / 2))
        const b = Math.abs(Math.cos(r * 5.2))
        const d = Math.min(a, b) * 0.22 * w
        return [d * 0.6, d * 0.8]
      })
    }
    const N = 60
    return modulatedLathe(p, N * 16, (th, r, z) => {
      const w = smoothstep(16.5, 17.6, r) * smoothstep(z0 + 0.25, z0 + 0.9, z)
      if (w <= 0) return [0, 0]
      const f = 0.5 + 0.5 * Math.cos(th * N)
      const d = Math.pow(1 - f, 1.6) * 0.62 * w
      return [-d * 0.62, -d * 0.78]
    })
  }
  if (style === 'thin') {
    // lunette fine et polie des montres habillées
    return lathe(
      roundProfile(
        [
          [ri, z0],
          [ro - 0.3, z0],
          [ro - 0.3, z0 + 0.5],
          [18.3, 6.0],
          [16.4, 6.25],
          [ri, 6.0],
          [ri, z0],
        ],
        [0, 0.1, 0.4, 1.2, 0.5, 0.2, 0],
        8,
      ),
      200,
    )
  }
  if (style === 'octagon' || style === 'hexagon') {
    // lunette à pans plats, satinée sur le dessus, chanfreins polis
    const n = style === 'octagon' ? 8 : 6
    const p = roundProfile(
      [
        [ri, z0],
        [ro + 0.6, z0],
        [ro + 0.6, 5.9],
        [ro + 0.2, 6.45],
        [ri + 0.8, 6.45],
        [ri, 6.1],
        [ri, z0],
      ],
      [0, 0.1, 0.3, 0.3, 0.3, 0.2, 0],
      4,
    )
    return modulatedLathe(p, 384, (th, r) => {
      if (r < ri + 1.0) return [0, 0]
      const k = polygonFactor(th + (n === 8 ? 0 : Math.PI / 6), n, 0)
      const t = smoothstep(ri + 1.0, ri + 2.2, r)
      return [(r * k - r) * t, 0]
    })
  }
  // Lunettes à insert : anneau métal + crantage (plongée, GMT, règle à calcul) ou lisse
  const p = roundProfile(
    [
      [ri, z0],
      [ro, z0],
      [ro + 0.05, z0 + 0.4],
      [ro + 0.05, 6.1],
      [ro - 0.35, 6.45],
      [19.35, 6.45],
      [19.35, 6.05],
      [ri + 0.5, 6.05],
      [ri, 5.7],
      [ri, z0],
    ],
    [0, 0.15, 0.2, 0.35, 0.2, 0.05, 0, 0, 0.15, 0],
    5,
  )
  if (style === 'tachy' || style === 'gmt-metal') return lathe(p, 200)
  const N = style === 'slide' ? 72 : 120
  return modulatedLathe(p, N * 8, (th, r, z) => {
    if (r < ro - 0.25 || z < z0 + 0.35 || z > 6.15) return [0, 0]
    const f = 0.5 + 0.5 * Math.cos(th * N)
    return [style === 'slide' ? -0.42 * Math.pow(f, 2) : -0.34 * Math.pow(f, 0.7), 0]
  })
}

/** Lunettes polygonales souples (Nautilus / Aquanaut) : octogone aux angles arrondis. */
function softOctagon() {
  const { bezelRin: ri, bezelR: ro, bezelZ0: z0 } = DIM
  const p = roundProfile(
    [
      [ri, z0],
      [ro + 0.9, z0],
      [ro + 0.9, 5.6],
      [ro, 6.4],
      [ri + 0.8, 6.55],
      [ri, 6.2],
      [ri, z0],
    ],
    [0, 0.1, 0.6, 0.8, 0.4, 0.2, 0],
    6,
  )
  return modulatedLathe(p, 384, (th, r) => {
    if (r < ri + 1.0) return [0, 0]
    const k = polygonFactor(th, 8, 0.45)
    const t = smoothstep(ri + 1.0, ri + 2.6, r)
    return [(r * k - r) * t, 0]
  })
}

export function Bezel({ m, option, accent }: { m: WatchMaterials; option: BezelOption; accent: boolean }) {
  const style = option.style
  const soft = style === 'octagon' && !option.screws
  const geos = useDisposable(() => {
    const ring = soft ? softOctagon() : bezelRing(style)
    let screws: THREE.BufferGeometry | null = null
    if (style === 'octagon' && option.screws) {
      // huit vis à tête hexagonale aux sommets de l'octogone
      const list: THREE.BufferGeometry[] = []
      for (let k = 0; k < 8; k++) {
        const a = Math.PI / 8 + (k * TAU) / 8
        const r = 18.6
        list.push(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 6).rotateX(Math.PI / 2).rotateZ(a).translate(Math.cos(a) * r, Math.sin(a) * r, 6.55))
      }
      screws = merge(list)
    }
    return { ring, screws }
  }, [style, soft, option.screws])
  const mat = accent ? m.accent : style === 'octagon' || style === 'hexagon' ? m.metalBrushed : m.metal
  return (
    <group>
      <mesh geometry={geos.ring} material={mat} castShadow />
      {geos.screws && <mesh geometry={geos.screws} material={m.indexMetal} />}
    </group>
  )
}

export const INSERT_STYLES: BezelStyle[] = ['dive', 'tachy', 'gmt', 'gmt-metal', 'slide']

export function BezelInsert({ m, style }: { m: WatchMaterials; style: BezelStyle }) {
  const geos = useDisposable(() => {
    const ins = DIM.insertRin
    const p: P2[] = roundProfile(
      [
        [ins, 6.05],
        [19.3, 6.05],
        [19.3, 6.42],
        [19.1, 6.5],
        [ins + 0.3, style === 'dive' ? 6.82 : 6.75],
        [ins, 6.6],
        [ins, 6.05],
      ],
      [0, 0, 0.08, 0.1, 0.12, 0.08, 0],
      3,
    )
    const ring = lathe(p, 240)
    planarUV(ring, DIM.bezelR)
    let pip: THREE.BufferGeometry | null = null
    let pipRim: THREE.BufferGeometry | null = null
    if (style === 'dive') {
      pip = new THREE.SphereGeometry(0.62, 24, 12).scale(1, 1, 0.55).translate(0, 17.75, 6.86)
      pipRim = new THREE.TorusGeometry(0.7, 0.14, 12, 32).translate(0, 17.75, 6.82)
    }
    return { ring, pip, pipRim }
  }, [style])
  if (!m.ceramic) return null
  return (
    <group>
      <mesh geometry={geos.ring} material={m.ceramic} />
      {geos.pip && <mesh geometry={geos.pip} material={m.lume} />}
      {geos.pipRim && <mesh geometry={geos.pipRim} material={m.indexMetal} />}
    </group>
  )
}

export function Crystal({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(
    () =>
      lathe(
        roundProfile(
          [
            [0, DIM.crystalZ1],
            [9, DIM.crystalZ1 - 0.08],
            [14.2, DIM.crystalZ1 - 0.28],
            [15.6, DIM.crystalZ1 - 0.75],
            [DIM.crystalR, 6.2],
            [DIM.crystalR, DIM.crystalZ0],
            [0, DIM.crystalZ0],
          ],
          [0, 0, 0.8, 0.5, 0.2, 0, 0],
          6,
        ),
        128,
      ),
    [],
  )
  return <mesh geometry={geo} material={m.crystal} renderOrder={2} />
}

export function Cyclops({ m, angle = 0, r = 11.8 }: { m: WatchMaterials; angle?: number; r?: number }) {
  const geo = useDisposable(() => {
    const g = lathe(
      roundProfile(
        [
          [0, 1.25],
          [1.6, 1.15],
          [2.75, 0.75],
          [3.2, 0.2],
          [3.2, 0],
          [0, 0],
        ],
        [0, 0.4, 0.6, 0.3, 0, 0],
        5,
      ),
      64,
    )
    g.scale(1.12, 1, 1)
    g.rotateZ(angle)
    g.translate(Math.cos(angle) * r, Math.sin(angle) * r, DIM.crystalZ1 - 0.45 - (r > 11 ? 0 : 0.1))
    return g
  }, [angle, r])
  return <mesh geometry={geo} material={m.crystal} renderOrder={3} />
}
