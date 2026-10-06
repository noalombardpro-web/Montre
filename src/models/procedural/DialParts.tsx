import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DIM } from '../dims'
import { circlePath, circleShape, extrudeZ, merge, planarUV, place } from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { WatchId } from '../../data/watches'
import type { WatchMaterials } from '../materials'
import { useAtelier } from '../../store/useAtelier'

const TAU = Math.PI * 2
const DATE_WIN = { x0: 9.75, x1: 13.15, y0: -1.75, y1: 1.75 }

export function Dial({ m, date }: { m: WatchMaterials; date: boolean }) {
  const geo = useDisposable(() => {
    const s = circleShape(DIM.dialR)
    if (date) {
      const h = new THREE.Path()
      h.moveTo(DATE_WIN.x0, DATE_WIN.y0)
      h.lineTo(DATE_WIN.x0, DATE_WIN.y1)
      h.lineTo(DATE_WIN.x1, DATE_WIN.y1)
      h.lineTo(DATE_WIN.x1, DATE_WIN.y0)
      h.closePath()
      s.holes.push(h)
    }
    const g = new THREE.ShapeGeometry(s, 96)
    planarUV(g, DIM.dialR)
    g.translate(0, 0, DIM.dialZ)
    return g
  }, [date])
  return <mesh geometry={geo} material={m.dial} receiveShadow />
}

export function DateWheel({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const s = circleShape(DIM.dateR - 0.2)
    s.holes.push(circlePath(8.6, 0, 0, true))
    const g = new THREE.ShapeGeometry(s, 96)
    planarUV(g, DIM.dateR)
    g.translate(0, 0, DIM.dateZ)
    return g
  }, [])
  return <mesh geometry={geo} material={m.dateDisc} />
}

/** Barre facettée (index bâton) orientée radialement. */
function baton(w: number, len: number, h: number, r: number, angle: number, z: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -len / 2)
  s.lineTo(w / 2, -len / 2)
  s.lineTo(w / 2, len / 2)
  s.lineTo(-w / 2, len / 2)
  s.closePath()
  const g = extrudeZ(s, h, z, Math.min(w, h) * 0.32, 2)
  g.translate(0, r, 0)
  g.rotateZ(angle)
  return g
}

function roundPlot(rad: number, h: number, r: number, angle: number, z: number) {
  const g = extrudeZ(circleShape(rad), h, z, rad * 0.22, 24)
  g.translate(0, r, 0)
  g.rotateZ(angle)
  return g
}

function triangle(size: number, h: number, r: number, z: number) {
  const s = new THREE.Shape()
  s.moveTo(-size * 0.62, size * 0.55)
  s.lineTo(size * 0.62, size * 0.55)
  s.lineTo(0, -size * 0.6)
  s.closePath()
  return extrudeZ(s, h, z, size * 0.1, 2).translate(0, r, 0)
}

export function Indices({ m, model, date }: { m: WatchMaterials; model: WatchId; date: boolean }) {
  const geos = useDisposable(() => {
    const metal: THREE.BufferGeometry[] = []
    const lume: THREE.BufferGeometry[] = []
    const z = DIM.dialZ
    for (let h = 0; h < 12; h++) {
      const a = -(h / 12) * TAU
      if (h === 3 && date) continue
      if (model === 'datejust') {
        if (h === 0) {
          metal.push(place(baton(0.95, 2.6, 0.5, 12.3, 0, z), -0.68, 0), place(baton(0.95, 2.6, 0.5, 12.3, 0, z), 0.68, 0))
        } else metal.push(baton(1.0, 2.6, 0.5, 12.3, a, z))
        // pastille luminescente au bout de chaque index
        lume.push(roundPlot(0.28, 0.1, 14.25, a, z))
      } else if (model === 'submariner') {
        if (h === 0) {
          metal.push(triangle(3.1, 0.42, 12.0, z))
          lume.push(triangle(2.55, 0.48, 12.05, z + 0.02))
        } else if (h === 6 || h === 9) {
          metal.push(baton(1.6, 3.7, 0.42, 12.2, a, z))
          lume.push(baton(1.15, 3.25, 0.48, 12.2, a, z + 0.02))
        } else {
          metal.push(roundPlot(1.2, 0.42, 12.55, a, z))
          lume.push(roundPlot(0.95, 0.48, 12.55, a, z + 0.02))
        }
      } else {
        const w = h === 0 ? 1.5 : 1.0
        metal.push(baton(w, 2.0, 0.45, 12.65, a, z))
        lume.push(baton(w * 0.5, 1.5, 0.5, 12.7, a, z + 0.02))
      }
    }
    return { metal: merge(metal), lume: merge(lume) }
  }, [model, date])
  return (
    <group>
      <mesh geometry={geos.metal} material={m.indexMetal} castShadow />
      <mesh geometry={geos.lume} material={m.lume} />
    </group>
  )
}

/* ---------------------------------- Aiguilles ---------------------------------- */

type HandKind = 'hour' | 'minute'

function handShape(model: WatchId, kind: HandKind, inset = 0) {
  const L = kind === 'hour' ? (model === 'submariner' ? 8.6 : 8.4) : 13.1
  const s = new THREE.Shape()
  const i = inset
  if (model === 'submariner') {
    const w = kind === 'hour' ? 1.05 : 0.8
    s.moveTo(-0.45 + i * 0.3, -2.2 + i)
    s.lineTo(0.45 - i * 0.3, -2.2 + i)
    s.lineTo(0.45 - i * 0.3, 1.2 + i)
    s.lineTo(w - i, 2.2 + i)
    s.lineTo(w - i, L - 2.2 - i * 0.4)
    s.lineTo(0, L - i * 1.6)
    s.lineTo(-w + i, L - 2.2 - i * 0.4)
    s.lineTo(-w + i, 2.2 + i)
    s.lineTo(-0.45 + i * 0.3, 1.2 + i)
  } else if (model === 'datejust') {
    const w = kind === 'hour' ? 0.62 : 0.5
    s.moveTo(-0.5 + i * 0.4, -2.0 + i)
    s.lineTo(0.5 - i * 0.4, -2.0 + i)
    s.lineTo(w - i, L - 1.4 - i)
    s.lineTo(0, L - i * 1.4)
    s.lineTo(-w + i, L - 1.4 - i)
  } else {
    const w = kind === 'hour' ? 0.6 : 0.5
    s.moveTo(-w + i, -1.8 + i)
    s.lineTo(w - i, -1.8 + i)
    s.lineTo(w - i, L - i)
    s.lineTo(-w + i, L - i)
  }
  s.closePath()
  return s
}

function handGeos(model: WatchId, kind: HandKind, z: number) {
  const body = extrudeZ(handShape(model, kind), 0.2, z, 0.06, 2)
  const hub = new THREE.CylinderGeometry(kind === 'hour' ? 1.0 : 0.85, kind === 'hour' ? 1.0 : 0.85, 0.24, 32)
    .rotateX(Math.PI / 2)
    .translate(0, 0, z + 0.12)
  const metal = merge([body, hub])
  // Remplissage luminescent : bande intérieure
  const lumeShape = handShape(model, kind, model === 'submariner' ? 0.28 : 0.2)
  const lume = extrudeZ(lumeShape, 0.08, z + 0.2, 0, 2)
  // supprime la partie basse de la bande (sous le canon)
  const pos = lume.attributes.position
  for (let k = 0; k < pos.count; k++) if (pos.getY(k) < 2.2) pos.setY(k, 2.2)
  pos.needsUpdate = true
  lume.computeVertexNormals()
  return { metal, lume }
}

function secondsGeos(model: WatchId, z: number, chrono: boolean) {
  const parts: THREE.BufferGeometry[] = []
  const needle = new THREE.Shape()
  const L = 13.9
  needle.moveTo(-0.16, -3.6)
  needle.lineTo(0.16, -3.6)
  needle.lineTo(0.09, L)
  needle.lineTo(-0.09, L)
  needle.closePath()
  parts.push(extrudeZ(needle, 0.14, z, 0, 2))
  parts.push(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 32).rotateX(Math.PI / 2).translate(0, 0, z + 0.15))
  parts.push(new THREE.CylinderGeometry(0.75, 0.75, 0.14, 32).rotateX(Math.PI / 2).translate(0, -2.9, z + 0.07))
  const lumeParts: THREE.BufferGeometry[] = []
  if (model === 'submariner' && !chrono) {
    parts.push(extrudeZ(circleShape(0.72, 0, 10.2), 0.14, z, 0, 24))
    lumeParts.push(extrudeZ(circleShape(0.55, 0, 10.2), 0.06, z + 0.14, 0, 24))
  } else if (!chrono) {
    lumeParts.push(extrudeZ(circleShape(0.2, 0, 12.6), 0.06, z + 0.14, 0, 12))
  }
  return { metal: merge(parts), lume: lumeParts.length ? merge(lumeParts) : null }
}

function useTime(chrono: boolean) {
  // Lecture partagée de l'heure locale ; trotteuse à 8 Hz.
  const mode = useAtelier((s) => s.mode)
  const chronoStart = useRef(0)
  const running = chrono && mode === 'movement'
  if (running && chronoStart.current === 0) chronoStart.current = performance.now()
  if (!running) chronoStart.current = 0
  return () => {
    const now = new Date()
    const ms = now.getMilliseconds()
    const sec = now.getSeconds() + Math.floor(ms / 125) / 8
    const min = now.getMinutes() + sec / 60
    const hour = (now.getHours() % 12) + min / 60
    const chronoSec = chronoStart.current ? Math.floor(((performance.now() - chronoStart.current) / 1000) * 8) / 8 : 0
    return { sec, min, hour, chronoSec }
  }
}

export function HourHand({ m, model }: { m: WatchMaterials; model: WatchId }) {
  const geos = useDisposable(() => handGeos(model, 'hour', 4.05), [model])
  const ref = useRef<THREE.Group>(null)
  const time = useTime(false)
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = -(time().hour / 12) * TAU
  })
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={m.indexMetal} castShadow />
      <mesh geometry={geos.lume} material={m.lume} />
    </group>
  )
}

export function MinuteHand({ m, model }: { m: WatchMaterials; model: WatchId }) {
  const geos = useDisposable(() => handGeos(model, 'minute', 4.45), [model])
  const ref = useRef<THREE.Group>(null)
  const time = useTime(false)
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = -(time().min / 60) * TAU
  })
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={m.indexMetal} castShadow />
      <mesh geometry={geos.lume} material={m.lume} />
    </group>
  )
}

export function SecondsHand({ m, model, chrono }: { m: WatchMaterials; model: WatchId; chrono: boolean }) {
  const geos = useDisposable(() => secondsGeos(model, 4.85, chrono), [model, chrono])
  const ref = useRef<THREE.Group>(null)
  const time = useTime(chrono)
  useFrame(() => {
    if (!ref.current) return
    const t = time()
    ref.current.rotation.z = -((chrono ? t.chronoSec : t.sec) / 60) * TAU
  })
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={m.indexMetal} castShadow />
      {geos.lume && <mesh geometry={geos.lume} material={m.lume} />}
    </group>
  )
}

/** Aiguilles des trois compteurs du chronographe. */
export function SubdialHands({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.14, -0.9)
    s.lineTo(0.14, -0.9)
    s.lineTo(0.07, 3.1)
    s.lineTo(-0.07, 3.1)
    s.closePath()
    const needle = extrudeZ(s, 0.12, DIM.dialZ + 0.25, 0, 2)
    const hub = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 24).rotateX(Math.PI / 2).translate(0, 0, DIM.dialZ + 0.3)
    return merge([needle, hub])
  }, [])
  const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)]
  const time = useTime(true)
  useFrame(() => {
    const t = time()
    const [mins, hours, secs] = refs.map((r) => r.current)
    if (secs) secs.rotation.z = -(t.sec / 60) * TAU
    if (mins) mins.rotation.z = -(t.chronoSec / 60 / 30) * TAU
    if (hours) hours.rotation.z = -(t.chronoSec / 3600 / 12) * TAU
  })
  return (
    <group>
      <group ref={refs[0]} position={[7.4, 0, 0]}>
        <mesh geometry={geo} material={m.indexMetal} />
      </group>
      <group ref={refs[1]} position={[0, -7.4, 0]}>
        <mesh geometry={geo} material={m.indexMetal} />
      </group>
      <group ref={refs[2]} position={[-7.4, 0, 0]}>
        <mesh geometry={geo} material={m.indexMetal} />
      </group>
    </group>
  )
}
