import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DIM } from '../dims'
import {
  annulusShape,
  circlePath,
  circleShape,
  escapeWheelShape,
  extrudeZ,
  gearShape,
  merge,
  smoothShape,
  stadium,
  type P2,
} from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { WatchMaterials } from '../materials'
import { anim } from '../../store/useAtelier'

const TAU = Math.PI * 2

/** Centres des mobiles (mm). */
export const POS = {
  barrel: [-4.5, 4.5] as P2,
  center: [0, 0] as P2,
  third: [6.6, 3.4] as P2,
  fourth: [6.4, -3.6] as P2,
  escape: [2.6, -7.6] as P2,
  pallet: [-0.9, -8.4] as P2,
  balance: [-6.2, -8.2] as P2,
}

/**
 * Horloge du mouvement : temps virtuel (accéléré / ralenti selon le mode).
 * Le balancier bat à 4 Hz (28 800 alt/h), l'échappement avance d'1/30 de tour par alternance.
 */
export const movementClock = { t: 0, scale: 1 }

export function MovementClock() {
  useFrame((_, dt) => {
    movementClock.t += Math.min(dt, 0.1) * movementClock.scale
  })
  return null
}

const balanceAngle = (t: number) => 4.2 * Math.sin(TAU * 4 * t)
const beats = (t: number) => Math.floor(t * 8 + 0.25)

function useSpin(fn: (t: number) => number) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = fn(movementClock.t)
  })
  return ref
}

/* ----------------------------------- Platine ----------------------------------- */

export function MainPlate({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const s = circleShape(DIM.movementR)
    const holes: P2[] = [
      [10.5, 8.6],
      [-12.2, -2.4],
      [9.6, -9.8],
      [-2.4, 12.6],
      [12.8, 2.6],
    ]
    holes.forEach(([x, y]) => s.holes.push(circlePath(0.55, x, y, true)))
    const plate = extrudeZ(s, 1.45, 1.55, 0.18, 64)
    const ring = extrudeZ(annulusShape(DIM.innerR - 0.25, DIM.movementR + 0.05), 1.3, 1.6, 0.1, 96)
    return { plate, ring }
  }, [])
  return (
    <group>
      <mesh geometry={geos.plate} material={m.plate} />
      <mesh geometry={geos.ring} material={m.steelPart} />
    </group>
  )
}

/* ----------------------------------- Rouage ----------------------------------- */

function Wheel({
  m,
  at,
  r,
  teeth,
  z,
  pinion,
  spin,
  spokes = 4,
}: {
  m: WatchMaterials
  at: P2
  r: number
  teeth: number
  z: number
  pinion: number
  spin: (t: number) => number
  spokes?: number
}) {
  const geos = useDisposable(() => {
    const wheel = extrudeZ(gearShape({ teeth, r, spokes }), 0.16, z, 0, 2)
    const pin = extrudeZ(gearShape({ teeth: 8, r: pinion, spokes: 0, hole: 0, toothDepth: pinion * 0.35 }), 1.0, z - 0.45, 0, 2)
    const arbor = new THREE.CylinderGeometry(0.16, 0.16, 3.0, 12).rotateX(Math.PI / 2).translate(0, 0, z - 0.2)
    const hub = new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.26, 24).rotateX(Math.PI / 2).translate(0, 0, z + 0.08)
    return { wheel, steel: merge([pin, arbor, hub]) }
  }, [r, teeth, z, pinion, spokes])
  const ref = useSpin(spin)
  return (
    <group position={[at[0], at[1], 0]}>
      <group ref={ref}>
        <mesh geometry={geos.wheel} material={m.gilt} />
        <mesh geometry={geos.steel} material={m.steelPart} />
      </group>
    </group>
  )
}

export function Barrel({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const drum = extrudeZ(gearShape({ teeth: 84, r: 5.3, spokes: 0, hole: 0, toothDepth: 0.32 }), 1.35, -0.1, 0, 2)
    const lid = extrudeZ(circleShape(4.6), 0.12, -0.18, 0, 64)
    const arbor = new THREE.CylinderGeometry(0.85, 0.85, 1.8, 32).rotateX(Math.PI / 2).translate(0, 0, 0.6)
    // ressort moteur visible par la tranche du couvercle : spirale plate
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 600; i++) {
      const t = i / 600
      const a = t * TAU * 9
      const rr = 1.1 + 3.1 * t
      pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, -0.22))
    }
    const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.05, 3, false)
    return { drum, lid, steel: merge([arbor, spring]) }
  }, [])
  const ref = useSpin((t) => -t * 0.02)
  return (
    <group position={[POS.barrel[0], POS.barrel[1], 0]}>
      <group ref={ref}>
        <mesh geometry={geos.drum} material={m.gilt} />
        <mesh geometry={geos.lid} material={m.steelPart} />
        <mesh geometry={geos.steel} material={m.steelPart} />
      </group>
    </group>
  )
}

export const CenterWheel = ({ m }: { m: WatchMaterials }) => (
  <Wheel m={m} at={POS.center} r={4.4} teeth={80} z={1.25} pinion={0.7} spin={(t) => -(t / 3600) * TAU * 20} spokes={4} />
)
export const ThirdWheel = ({ m }: { m: WatchMaterials }) => (
  <Wheel m={m} at={POS.third} r={3.6} teeth={75} z={0.85} pinion={0.6} spin={(t) => (t / 480) * TAU * 8} spokes={4} />
)
export const FourthWheel = ({ m }: { m: WatchMaterials }) => (
  <Wheel m={m} at={POS.fourth} r={3.2} teeth={70} z={0.45} pinion={0.55} spin={(t) => -(t / 60) * TAU} spokes={5} />
)

export function EscapeWheel({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const wheel = extrudeZ(escapeWheelShape(2.1), 0.14, 0.1, 0, 2)
    const pin = extrudeZ(gearShape({ teeth: 7, r: 0.5, spokes: 0, hole: 0, toothDepth: 0.18 }), 0.9, -0.4, 0, 2)
    const arbor = new THREE.CylinderGeometry(0.13, 0.13, 2.6, 12).rotateX(Math.PI / 2).translate(0, 0, 0)
    return { wheel, steel: merge([pin, arbor]) }
  }, [])
  const ref = useSpin((t) => beats(t) * (TAU / 30))
  return (
    <group position={[POS.escape[0], POS.escape[1], 0]}>
      <group ref={ref}>
        <mesh geometry={geos.wheel} material={m.steelPart} />
        <mesh geometry={geos.steel} material={m.steelPart} />
      </group>
    </group>
  )
}

export function PalletFork({ m }: { m: WatchMaterials }) {
  const [px, py] = POS.pallet
  const geos = useDisposable(() => {
    const rel = (x: number, y: number): P2 => [x - px, y - py]
    const entry = rel(1.25, -5.99)
    const exit = rel(0.99, -8.95)
    const fork = rel(-4.45, -8.3)
    const shapes = [
      stadium(0, 0, entry[0], entry[1], 0.32),
      stadium(0, 0, exit[0], exit[1], 0.32),
      stadium(0, 0, fork[0], fork[1], 0.26),
      stadium(fork[0], fork[1], fork[0] - 0.55, fork[1] + 0.45, 0.18),
      stadium(fork[0], fork[1], fork[0] - 0.55, fork[1] - 0.45, 0.18),
    ]
    const body = merge(shapes.map((s) => extrudeZ(s, 0.18, 0.1, 0, 10)))
    const boss = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24).rotateX(Math.PI / 2).translate(0, 0, 0.2)
    const staff = new THREE.CylinderGeometry(0.11, 0.11, 2.4, 12).rotateX(Math.PI / 2)
    const stone = (p: P2) => {
      const ang = Math.atan2(p[1], p[0])
      return new THREE.BoxGeometry(0.75, 0.42, 0.3).rotateZ(ang).translate(p[0] * 1.08, p[1] * 1.08, 0.19)
    }
    return { steel: merge([body, boss, staff]), ruby: merge([stone(entry), stone(exit)]) }
  }, [])
  const ref = useSpin((t) => (beats(t) % 2 ? 0.11 : -0.11))
  return (
    <group position={[px, py, 0]}>
      <group ref={ref}>
        <mesh geometry={geos.steel} material={m.steelPart} />
        <mesh geometry={geos.ruby} material={m.ruby} />
      </group>
    </group>
  )
}

export function BalanceWheel({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const rim = extrudeZ(annulusShape(3.9, 3.35), 0.5, -0.55, 0.06, 64)
    const arms = extrudeZ(stadium(-3.5, 0, 3.5, 0, 0.32), 0.26, -0.4, 0, 8)
    const weights: THREE.BufferGeometry[] = []
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + Math.PI / 4
      weights.push(
        new THREE.CylinderGeometry(0.42, 0.42, 0.42, 16)
          .rotateX(Math.PI / 2)
          .translate(Math.cos(a) * 3.05, Math.sin(a) * 3.05, -0.3),
      )
    }
    const staff = new THREE.CylinderGeometry(0.16, 0.16, 2.8, 12).rotateX(Math.PI / 2).translate(0, 0, 0.1)
    const roller = new THREE.CylinderGeometry(0.85, 0.85, 0.16, 24).rotateX(Math.PI / 2).translate(0, 0, 0.35)
    return { rim: merge([rim, arms]), gold: merge(weights), steel: merge([staff, roller]) }
  }, [])
  const ref = useSpin(balanceAngle)
  return (
    <group position={[POS.balance[0], POS.balance[1], 0]}>
      <group ref={ref}>
        <mesh geometry={geos.rim} material={m.gilt} />
        <mesh geometry={geos.gold} material={m.accent} />
        <mesh geometry={geos.steel} material={m.steelPart} />
      </group>
    </group>
  )
}

export function Hairspring({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const pts: THREE.Vector3[] = []
    const turns = 13
    for (let i = 0; i <= 1600; i++) {
      const t = i / 1600
      const a = t * TAU * turns
      const rr = 0.5 + 2.3 * t
      pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, -0.82))
    }
    // courbe terminale (type Breguet) vers le piton
    pts.push(new THREE.Vector3(3.0, 0.4, -0.95), new THREE.Vector3(2.6, 1.5, -1.0))
    const spiral = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 2400, 0.045, 3, false)
    const collet = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16).rotateX(Math.PI / 2).translate(0, 0, -0.82)
    return merge([spiral, collet])
  }, [])
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const a = balanceAngle(movementClock.t)
    ref.current.rotation.z = a * 0.15
    const s = 1 + a * 0.012
    ref.current.scale.set(s, s, 1)
  })
  return (
    <group position={[POS.balance[0], POS.balance[1], 0]}>
      <group ref={ref}>
        <mesh geometry={geo} material={m.blued} />
      </group>
    </group>
  )
}

/* ----------------------------------- Ponts ----------------------------------- */

export function Bridges({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const barrelBridge = smoothShape([
      [-13.7, 3.0],
      [-12.3, 8.0],
      [-8.2, 11.9],
      [-3.0, 13.6],
      [1.4, 13.1],
      [2.6, 9.4],
      [1.2, 5.0],
      [-0.4, 1.6],
      [-4.4, -1.6],
      [-10.6, -1.8],
    ])
    const trainBridge = smoothShape([
      [3.6, 6.8],
      [9.0, 8.0],
      [12.6, 4.6],
      [13.4, -1.0],
      [11.6, -6.6],
      [7.0, -10.8],
      [3.6, -11.6],
      [0.9, -10.0],
      [1.5, -5.6],
      [4.1, -1.8],
      [3.1, 2.4],
    ])
    const palletBridge = stadium(-2.6, -10.9, 0.4, -6.4, 0.85)
    const plates = merge([
      extrudeZ(barrelBridge, 0.95, -1.12, 0.2, 2),
      extrudeZ(trainBridge, 0.95, -1.12, 0.2, 2),
      extrudeZ(palletBridge, 0.7, -0.95, 0.15, 12),
    ])
    // rochet + roue de couronne, visibles sur le pont de barillet
    const ratchet = extrudeZ(gearShape({ teeth: 54, r: 3.7, spokes: 0, hole: 0.6, toothDepth: 0.35 }), 0.35, -1.48, 0, 2).translate(
      POS.barrel[0],
      POS.barrel[1],
      0,
    )
    const crownWheel = extrudeZ(gearShape({ teeth: 28, r: 1.9, spokes: 0, hole: 0.3, toothDepth: 0.3 }), 0.3, -1.42, 0, 2).translate(
      1.0,
      9.6,
      0,
    )
    const screwPts: P2[] = [
      [POS.barrel[0], POS.barrel[1]],
      [-10.4, 6.6],
      [-1.6, 11.6],
      [10.6, 4.2],
      [9.4, -7.6],
      [4.0, -10.2],
      [-1.8, -9.9],
    ]
    const screws = merge(
      screwPts.map(([x, y], i) => {
        const r = i === 0 ? 0.9 : 0.55
        const head = new THREE.CylinderGeometry(r, r, 0.28, 24).rotateX(Math.PI / 2).translate(x, y, i === 0 ? -1.6 : -1.2)
        return head
      }),
    )
    return { plates, steel: merge([ratchet, crownWheel]), screws }
  }, [])
  return (
    <group>
      <mesh geometry={geos.plates} material={m.bridge} />
      <mesh geometry={geos.steel} material={m.steelPart} />
      <mesh geometry={geos.screws} material={m.blued} />
    </group>
  )
}

export function BalanceBridge({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const [bx, by] = POS.balance
    const bar = extrudeZ(stadium(-11.6, -3.4, -0.9, -12.9, 1.15), 0.7, -1.75, 0.16, 12)
    const boss = extrudeZ(circleShape(1.9, bx, by), 0.7, -1.75, 0.16, 32)
    const shock = new THREE.TorusGeometry(0.75, 0.12, 8, 32).translate(bx, by, -1.82)
    const screws = merge(
      [
        [-10.7, -4.3],
        [-1.7, -12.1],
      ].map(([x, y]) => new THREE.CylinderGeometry(0.55, 0.55, 0.26, 24).rotateX(Math.PI / 2).translate(x, y, -1.82)),
    )
    return { plate: merge([bar, boss]), shock, screws }
  }, [])
  return (
    <group>
      <mesh geometry={geos.plate} material={m.bridge} />
      <mesh geometry={geos.shock} material={m.gilt} />
      <mesh geometry={geos.screws} material={m.blued} />
    </group>
  )
}

export function Jewels({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const pts: [number, number, number][] = [
      [POS.third[0], POS.third[1], -1.18],
      [POS.fourth[0], POS.fourth[1], -1.18],
      [POS.escape[0], POS.escape[1], -1.18],
      [POS.pallet[0], POS.pallet[1], -1.0],
      [POS.balance[0], POS.balance[1], -1.86],
      [-0.6, 3.2, -1.18],
      [-7.6, 9.2, -1.18],
      [11.8, -1.6, -1.18],
      [6.0, 5.9, -1.18],
    ]
    return merge(pts.map(([x, y, z]) => new THREE.TorusGeometry(0.42, 0.19, 10, 28).translate(x, y, z)))
  }, [])
  return <mesh geometry={geo} material={m.ruby} />
}

export function Rotor({ m }: { m: WatchMaterials }) {
  const geos = useDisposable(() => {
    const R = DIM.movementR - 0.6
    const plateShape = new THREE.Shape()
    plateShape.absarc(0, 0, R - 2.2, Math.PI + 0.06, TAU - 0.06, false)
    plateShape.absarc(0, 0, 2.2, -0.5, -Math.PI + 0.5, true)
    plateShape.closePath()
    const plate = extrudeZ(plateShape, 0.28, -2.18, 0.05, 64)
    const massShape = new THREE.Shape()
    massShape.absarc(0, 0, R, Math.PI + 0.02, TAU - 0.02, false)
    massShape.absarc(0, 0, R - 2.4, TAU - 0.04, Math.PI + 0.04, true)
    massShape.closePath()
    const mass = extrudeZ(massShape, 0.62, -2.5, 0.12, 64)
    const hub = new THREE.CylinderGeometry(2.3, 2.3, 0.5, 48).rotateX(Math.PI / 2).translate(0, 0, -2.1)
    const screw = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 32).rotateX(Math.PI / 2).translate(0, 0, -2.42)
    return { body: merge([plate, mass]), hub: merge([hub, screw]) }
  }, [])
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const t = movementClock.t
    // Balancement « au poignet » : oscillations amorties + tours complets occasionnels
    const target = Math.sin(t * 0.9) * 1.6 + Math.sin(t * 0.37) * 2.4 + (anim.movement > 0.5 ? t * 0.6 : 0)
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, target, 3, dt)
  })
  return (
    <group ref={ref}>
      <mesh geometry={geos.body} material={m.rotor} />
      <mesh geometry={geos.hub} material={m.gilt} />
    </group>
  )
}
