import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DIM } from '../dims'
import { circleShape, extrudeZ, merge, planarUV, place } from '../../lib/geometry'
import { useDisposable } from '../../lib/useDisposable'
import type { HandStyle, WatchStyle } from '../../data/watches'
import type { WatchMaterials } from '../materials'
import { useAtelier } from '../../store/useAtelier'
import { POSTER_MODE } from '../../lib/env'
import { DATE_WIN, DAY_WIN, type DialLayout, type SubdialKind } from '../dialLayout'

const TAU = Math.PI * 2

/** Hauteurs (z) des aiguilles, de la plus basse à la plus haute. */
const Z = { hour: 4.05, gmt: 4.34, minute: 4.62, seconds: 4.92 }

function rectPath(cx: number, cy: number, w: number, h: number, angle = 0) {
  const p = new THREE.Path()
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const pts = [
    [-w / 2, -h / 2],
    [-w / 2, h / 2],
    [w / 2, h / 2],
    [w / 2, -h / 2],
  ].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c])
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)))
  p.closePath()
  return p
}

export function Dial({ m, layout }: { m: WatchMaterials; layout: DialLayout }) {
  const key = JSON.stringify([layout.date, layout.day, layout.moon])
  const geo = useDisposable(() => {
    const s = circleShape(DIM.dialR)
    if (layout.date) {
      const { angle, r } = layout.date
      s.holes.push(rectPath(Math.cos(angle) * r, Math.sin(angle) * r, DATE_WIN.w, DATE_WIN.h, angle))
    }
    if (layout.day) s.holes.push(rectPath(0, DAY_WIN.y, DAY_WIN.w, DAY_WIN.h))
    if (layout.moon) {
      const h = new THREE.Path()
      h.absarc(layout.moon.x, layout.moon.y, layout.moon.r, 0, Math.PI, false)
      h.closePath()
      s.holes.push(h)
    }
    const g = new THREE.ShapeGeometry(s, 96)
    planarUV(g, DIM.dialR)
    g.translate(0, 0, DIM.dialZ)
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return <mesh geometry={geo} material={m.dial} receiveShadow />
}

export function DateWheel({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const s = circleShape(DIM.dateR - 0.2)
    const hole = new THREE.Path()
    hole.absarc(0, 0, 8.6, 0, TAU, true)
    s.holes.push(hole)
    const g = new THREE.ShapeGeometry(s, 96)
    planarUV(g, DIM.dateR)
    g.translate(0, 0, DIM.dateZ)
    return g
  }, [])
  return <mesh geometry={geo} material={m.dateDisc} />
}

/** Disque des jours : secteur supérieur seulement (ne masque pas le quantième). */
export function DayWheel({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const s = new THREE.Shape()
    s.absarc(0, 0, 13.6, Math.PI / 3, (Math.PI * 2) / 3, false)
    s.absarc(0, 0, 9.6, (Math.PI * 2) / 3, Math.PI / 3, true)
    s.closePath()
    const g = new THREE.ShapeGeometry(s, 48)
    planarUV(g, DIM.dateR)
    g.translate(0, 0, DIM.dateZ + 0.06)
    return g
  }, [])
  return <mesh geometry={geo} material={m.dayDisc} />
}

/** Âge de la Lune (0 = nouvelle lune, 0,5 = pleine lune). */
export function moonPhase(date = new Date()) {
  const synodic = 29.530588853
  const ref = Date.UTC(2000, 0, 6, 18, 14)
  const days = (date.getTime() - ref) / 86400000
  return (((days % synodic) + synodic) % synodic) / synodic
}

/** Disque de phases de lune, orienté selon la vraie phase du jour. */
export function MoonDisc({ m, layout }: { m: WatchMaterials; layout: DialLayout }) {
  const geo = useDisposable(() => {
    const g = new THREE.CircleGeometry(6, 96)
    planarUV(g, 6)
    return g
  }, [])
  const rot = useMemo(() => (moonPhase() - 0.5) * Math.PI, [])
  if (!layout.moon) return null
  return (
    <group position={[layout.moon.x, layout.moon.discY, DIM.dateZ - 0.05]} rotation={[0, 0, rot]}>
      <mesh geometry={geo} material={m.moon} />
    </group>
  )
}

/* ------------------------------------ Index ------------------------------------ */

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

export function Indices({ m, style, layout }: { m: WatchMaterials; style: WatchStyle; layout: DialLayout }) {
  const lumeOn = style.lume !== false
  const geos = useDisposable(() => {
    const metal: THREE.BufferGeometry[] = []
    const lume: THREE.BufferGeometry[] = []
    const z = DIM.dialZ
    for (let h = 0; h < 12; h++) {
      const a = -(h / 12) * TAU
      if (layout.skipHours.has(h)) continue
      switch (style.indices) {
        case 'baton':
          if (h === 0) metal.push(place(baton(0.95, 2.6, 0.5, 12.3, 0, z), -0.68, 0), place(baton(0.95, 2.6, 0.5, 12.3, 0, z), 0.68, 0))
          else metal.push(baton(1.0, 2.6, 0.5, 12.3, a, z))
          if (lumeOn) lume.push(roundPlot(0.28, 0.1, 14.25, a, z))
          break
        case 'dive':
          if (h === 0) {
            metal.push(triangle(3.1, 0.42, 12.0, z))
            lume.push(triangle(2.55, 0.48, 12.05, z + 0.02))
          } else if (h === 6 || h === 9 || (h === 3 && !layout.date)) {
            metal.push(baton(1.6, 3.7, 0.42, 12.2, a, z))
            lume.push(baton(1.15, 3.25, 0.48, 12.2, a, z + 0.02))
          } else {
            metal.push(roundPlot(1.2, 0.42, 12.55, a, z))
            lume.push(roundPlot(0.95, 0.48, 12.55, a, z + 0.02))
          }
          break
        case 'explorer':
          if (h === 3 || h === 6 || h === 9) break
          if (h === 0) {
            metal.push(triangle(2.9, 0.42, 12.1, z))
            if (lumeOn) lume.push(triangle(2.35, 0.48, 12.15, z + 0.02))
          } else {
            metal.push(baton(1.1, 2.9, 0.42, 12.4, a, z))
            if (lumeOn) lume.push(baton(0.7, 2.5, 0.48, 12.4, a, z + 0.02))
          }
          break
        case 'obus':
          if (h === 0) metal.push(place(baton(0.5, 3.4, 0.45, 12.1, 0, z), -0.45, 0), place(baton(0.5, 3.4, 0.45, 12.1, 0, z), 0.45, 0))
          else metal.push(baton(0.55, 3.0, 0.45, 12.3, a, z))
          break
        case 'stick':
          if (h === 0) {
            metal.push(place(baton(0.95, 3.2, 0.45, 12.2, 0, z), -0.7, 0), place(baton(0.95, 3.2, 0.45, 12.2, 0, z), 0.7, 0))
            if (lumeOn) lume.push(place(baton(0.45, 2.7, 0.5, 12.2, 0, z + 0.02), -0.7, 0), place(baton(0.45, 2.7, 0.5, 12.2, 0, z + 0.02), 0.7, 0))
          } else {
            metal.push(baton(1.0, 3.0, 0.45, 12.3, a, z))
            if (lumeOn) lume.push(baton(0.5, 2.5, 0.5, 12.3, a, z + 0.02))
          }
          break
        case 'short': {
          const w = h === 0 ? 1.5 : 1.0
          metal.push(baton(w, 2.0, 0.45, 12.65, a, z))
          if (lumeOn) lume.push(baton(w * 0.5, 1.5, 0.5, 12.7, a, z + 0.02))
          break
        }
        case 'arabic':
        case 'roman':
          // chiffres imprimés : seulement de petits plots luminescents au chemin de fer
          if (lumeOn && style.indices === 'arabic') lume.push(roundPlot(0.3, 0.12, 13.9, a, z))
          break
      }
    }
    // géométrie minimale pour garder un maillage valide
    if (!metal.length) metal.push(roundPlot(0.01, 0.01, 0, 0, z - 0.1))
    return { metal: merge(metal), lume: lume.length ? merge(lume) : null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style.indices, lumeOn, JSON.stringify([...layout.skipHours]), !!layout.date])
  return (
    <group>
      <mesh geometry={geos.metal} material={m.indexMetal} castShadow />
      {geos.lume && <mesh geometry={geos.lume} material={m.lume} />}
    </group>
  )
}

/* ---------------------------------- Aiguilles ---------------------------------- */

type HandKind = 'hour' | 'minute'

function handShape(style: HandStyle, kind: HandKind, inset = 0) {
  const L = kind === 'hour' ? (style === 'sword' ? 8.6 : 8.4) : 13.1
  const s = new THREE.Shape()
  const i = inset
  switch (style) {
    case 'sword': {
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
      break
    }
    case 'dauphine': {
      const w = kind === 'hour' ? 0.62 : 0.5
      s.moveTo(-0.5 + i * 0.4, -2.0 + i)
      s.lineTo(0.5 - i * 0.4, -2.0 + i)
      s.lineTo(w - i, L - 1.4 - i)
      s.lineTo(0, L - i * 1.4)
      s.lineTo(-w + i, L - 1.4 - i)
      break
    }
    case 'leaf': {
      // feuille (lancette) : flancs galbés
      const w = kind === 'hour' ? 0.85 : 0.65
      s.moveTo(-0.3 + i * 0.2, -1.8 + i)
      s.lineTo(0.3 - i * 0.2, -1.8 + i)
      s.quadraticCurveTo(w * 1.6 - i, L * 0.55, 0, L - i * 1.4)
      s.quadraticCurveTo(-w * 1.6 + i, L * 0.55, -0.3 + i * 0.2, -1.8 + i)
      break
    }
    case 'pencil': {
      const w = kind === 'hour' ? 0.55 : 0.45
      s.moveTo(-w + i, -1.8 + i)
      s.lineTo(w - i, -1.8 + i)
      s.lineTo(w - i, L - 1.3)
      s.lineTo(0, L - i)
      s.lineTo(-w + i, L - 1.3)
      break
    }
    case 'breguet': {
      // tige fine (la « pomme » évidée est ajoutée séparément)
      const w = 0.17
      s.moveTo(-0.32, -1.6)
      s.lineTo(0.32, -1.6)
      s.lineTo(w, L * 0.68)
      s.lineTo(w * 0.8, L - 0.2)
      s.lineTo(0, L)
      s.lineTo(-w * 0.8, L - 0.2)
      s.lineTo(-w, L * 0.68)
      break
    }
    default: {
      const w = kind === 'hour' ? 0.6 : 0.5
      s.moveTo(-w + i, -1.8 + i)
      s.lineTo(w - i, -1.8 + i)
      s.lineTo(w - i, L - i)
      s.lineTo(-w + i, L - i)
    }
  }
  s.closePath()
  return s
}

function handGeos(style: HandStyle, kind: HandKind, z: number, lumeOn: boolean) {
  const parts: THREE.BufferGeometry[] = [extrudeZ(handShape(style, kind), 0.2, z, 0.06, 2)]
  const r = kind === 'hour' ? 1.0 : 0.85
  parts.push(new THREE.CylinderGeometry(r, r, 0.24, 32).rotateX(Math.PI / 2).translate(0, 0, z + 0.12))
  if (style === 'breguet') {
    // « pomme » Breguet : anneau évidé près de la pointe
    const L = kind === 'hour' ? 8.4 : 13.1
    const ring = circleShape(kind === 'hour' ? 1.05 : 0.8, 0, L * 0.72)
    const hole = new THREE.Path()
    hole.absarc(0, L * 0.72, kind === 'hour' ? 0.62 : 0.46, 0, TAU, true)
    ring.holes.push(hole)
    parts.push(extrudeZ(ring, 0.2, z, 0, 24))
  }
  const metal = merge(parts)
  if (!lumeOn || style === 'breguet') return { metal, lume: null }
  // remplissage luminescent : bande intérieure
  const lume = extrudeZ(handShape(style, kind, style === 'sword' ? 0.28 : 0.2), 0.08, z + 0.2, 0, 2)
  const pos = lume.attributes.position
  for (let k = 0; k < pos.count; k++) if (pos.getY(k) < 2.2) pos.setY(k, 2.2)
  pos.needsUpdate = true
  lume.computeVertexNormals()
  return { metal, lume }
}

function secondsGeos(style: WatchStyle, z: number, chrono: boolean) {
  const parts: THREE.BufferGeometry[] = []
  const needle = new THREE.Shape()
  const L = 13.9
  needle.moveTo(-0.16, -3.6)
  needle.lineTo(0.16, -3.6)
  needle.lineTo(0.09, L)
  needle.lineTo(-0.09, L)
  needle.closePath()
  parts.push(extrudeZ(needle, 0.14, z, 0, 2))
  parts.push(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 32).rotateX(Math.PI / 2).translate(0, 0, z + 0.11))
  parts.push(new THREE.CylinderGeometry(0.75, 0.75, 0.14, 32).rotateX(Math.PI / 2).translate(0, -2.9, z + 0.07))
  const lumeParts: THREE.BufferGeometry[] = []
  if (style.lume !== false && !chrono) {
    if (style.indices === 'dive') {
      parts.push(extrudeZ(circleShape(0.72, 0, 10.2), 0.14, z, 0, 24))
      lumeParts.push(extrudeZ(circleShape(0.55, 0, 10.2), 0.06, z + 0.14, 0, 24))
    } else lumeParts.push(extrudeZ(circleShape(0.2, 0, 12.6), 0.06, z + 0.14, 0, 12))
  }
  return { metal: merge(parts), lume: lumeParts.length ? merge(lumeParts) : null }
}

/** Horloge partagée ; trotteuse à 8 Hz (glissante pour un Spring Drive). */
function useTime(chrono: boolean, glide = false) {
  const mode = useAtelier((s) => s.mode)
  const chronoStart = useRef(0)
  const running = chrono && mode === 'movement'
  if (running && chronoStart.current === 0) chronoStart.current = performance.now()
  if (!running) chronoStart.current = 0
  return () => {
    const now = POSTER_MODE ? new Date(2024, 0, 6, 10, 8, 37, 0) : new Date()
    const ms = now.getMilliseconds()
    const sec = now.getSeconds() + (glide ? ms / 1000 : Math.floor(ms / 125) / 8)
    const min = now.getMinutes() + sec / 60
    const hour = (now.getHours() % 12) + min / 60
    const utc = now.getUTCHours() + now.getUTCMinutes() / 60
    const chronoSec = chronoStart.current ? Math.floor(((performance.now() - chronoStart.current) / 1000) * 8) / 8 : 0
    return { sec, min, hour, utc, chronoSec }
  }
}

function useHand(fn: (t: ReturnType<ReturnType<typeof useTime>>) => number, chrono = false, glide = false) {
  const ref = useRef<THREE.Group>(null)
  const time = useTime(chrono, glide)
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = -fn(time()) * TAU
  })
  return ref
}

export function HourHand({ m, style }: { m: WatchMaterials; style: WatchStyle }) {
  const geos = useDisposable(() => handGeos(style.hands, 'hour', Z.hour, style.lume !== false), [style.hands, style.lume])
  const ref = useHand((t) => t.hour / 12)
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={m.hand} castShadow />
      {geos.lume && <mesh geometry={geos.lume} material={m.lume} />}
    </group>
  )
}

export function MinuteHand({ m, style }: { m: WatchMaterials; style: WatchStyle }) {
  const geos = useDisposable(() => handGeos(style.hands, 'minute', Z.minute, style.lume !== false), [style.hands, style.lume])
  const ref = useHand((t) => t.min / 60)
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={m.hand} castShadow />
      {geos.lume && <mesh geometry={geos.lume} material={m.lume} />}
    </group>
  )
}

export function SecondsHand({ m, style, glide }: { m: WatchMaterials; style: WatchStyle; glide: boolean }) {
  const chrono = !!style.chrono
  const geos = useDisposable(() => secondsGeos(style, Z.seconds, chrono), [style, chrono])
  const ref = useHand((t) => (chrono ? t.chronoSec : t.sec) / 60, chrono, glide)
  return (
    <group ref={ref}>
      <mesh geometry={geos.metal} material={style.handColor === 'blued' ? m.hand : m.indexMetal} castShadow />
      {geos.lume && <mesh geometry={geos.lume} material={m.lume} />}
    </group>
  )
}

/** Aiguille 24 h (second fuseau, réglée ici sur le temps universel). */
export function GmtHand({ m }: { m: WatchMaterials }) {
  const geo = useDisposable(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.14, -2.4)
    s.lineTo(0.14, -2.4)
    s.lineTo(0.1, 11.3)
    s.lineTo(0.95, 11.3)
    s.lineTo(0, 13.4)
    s.lineTo(-0.95, 11.3)
    s.lineTo(-0.1, 11.3)
    s.closePath()
    const body = extrudeZ(s, 0.14, Z.gmt, 0.03, 2)
    const hub = new THREE.CylinderGeometry(0.72, 0.72, 0.16, 32).rotateX(Math.PI / 2).translate(0, 0, Z.gmt + 0.08)
    return merge([body, hub])
  }, [])
  const ref = useHand((t) => t.utc / 24)
  return (
    <group ref={ref}>
      <mesh geometry={geo} material={m.gmtHand} castShadow />
    </group>
  )
}

/** Aiguilles des compteurs auxiliaires (chronographe, petite seconde). */
export function SubdialHands({ m, layout, glide }: { m: WatchMaterials; layout: DialLayout; glide: boolean }) {
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
  const refs = useRef<(THREE.Group | null)[]>([])
  const time = useTime(true, glide)
  useFrame(() => {
    const t = time()
    const angle: Record<SubdialKind, number> = {
      sec: t.sec / 60,
      chronoMin: t.chronoSec / 60 / 30,
      chronoHour: t.chronoSec / 3600 / 12,
    }
    layout.subdials.forEach((d, i) => {
      const g = refs.current[i]
      if (g) g.rotation.z = -angle[d.kind] * TAU
    })
  })
  return (
    <group>
      {layout.subdials.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[d.x, d.y, 0]}
          scale={[d.r / 3.55, d.r / 3.55, 1]}
        >
          <mesh geometry={geo} material={m.hand} />
        </group>
      ))}
    </group>
  )
}
