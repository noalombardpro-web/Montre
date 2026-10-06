import * as THREE from 'three'
import { DIM } from '../dims'
import { lathe, modulatedLathe, planarUV, roundProfile, type P2 } from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { BezelStyle } from '../../data/watches'
import type { WatchMaterials } from '../materials'

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function bezelRing(style: BezelStyle) {
  const { bezelRin: ri, bezelR: ro, bezelZ0: z0, bezelZ1: z1 } = DIM
  if (style === 'fluted' || style === 'smooth') {
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
    const N = 60
    return modulatedLathe(p, N * 16, (th, r, z) => {
      const w = smoothstep(16.5, 17.6, r) * smoothstep(z0 + 0.25, z0 + 0.9, z)
      if (w <= 0) return [0, 0]
      const f = 0.5 + 0.5 * Math.cos(th * N)
      const d = Math.pow(1 - f, 1.6) * 0.62 * w
      return [-d * 0.62, -d * 0.78]
    })
  }
  // Lunettes à insert : anneau métal + crantage (plongée) ou lisse (tachymètre)
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
  if (style === 'tachy') return lathe(p, 200)
  const N = 120
  return modulatedLathe(p, N * 8, (th, r, z) => {
    if (r < ro - 0.25 || z < z0 + 0.35 || z > 6.15) return [0, 0]
    const f = 0.5 + 0.5 * Math.cos(th * N)
    return [-0.34 * Math.pow(f, 0.7), 0]
  })
}

export function Bezel({ m, style, accent }: { m: WatchMaterials; style: BezelStyle; accent: boolean }) {
  const geo = useDisposable(() => bezelRing(style), [style])
  return <mesh geometry={geo} material={accent ? m.accent : m.metal} castShadow />
}

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

export function Cyclops({ m }: { m: WatchMaterials }) {
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
    g.translate(11.45, 0, DIM.crystalZ1 - 0.42)
    return g
  }, [])
  return <mesh geometry={geo} material={m.crystal} renderOrder={3} />
}
