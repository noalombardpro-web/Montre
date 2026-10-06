import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PartMeta } from '../../data/parts'
import { anim, useAtelier } from '../../store/useAtelier'

const v = new THREE.Vector3()
const c = new THREE.Vector3()
const toCam = new THREE.Vector3()
const center = new THREE.Vector3()

/** Repères affichés en vue assemblée (les autres apparaissent en vue éclatée). */
const PRIMARY = new Set(['crystal', 'bezel', 'bezelInsert', 'dial', 'crown', 'pushers', 'case', 'bracelet', 'clasp', 'caseback', 'cyclops'])
const MOVEMENT_PRIMARY = new Set(['rotor', 'balanceWheel', 'bridges', 'balanceBridge', 'jewels', 'barrel'])

/** Point cliquable ancré sur une pièce ; masqué s'il est du côté caché de la montre. */
export function Hotspot({ meta }: { meta: PartMeta }) {
  const page = useAtelier((s) => s.page)
  const enabled = useAtelier((s) => s.hotspots)
  const mode = useAtelier((s) => s.mode)
  const selected = useAtelier((s) => s.selected)
  const isolate = useAtelier((s) => s.isolate)
  const lang = useAtelier((s) => s.lang)
  const ready = useAtelier((s) => s.sceneReady)
  const group = useRef<THREE.Group>(null)
  const el = useRef<HTMLButtonElement>(null)

  const show =
    ready &&
    page === 'atelier' &&
    enabled &&
    !(isolate && selected && selected !== meta.id) &&
    (mode === 'movement' ? MOVEMENT_PRIMARY.has(meta.id) : mode === 'normal' ? PRIMARY.has(meta.id) : true)

  useFrame(({ camera }) => {
    const g = group.current
    const b = el.current
    if (!g || !b || !show) return
    g.getWorldPosition(v)
    // visibilité : en vue assemblée, les repères situés derrière la montre sont masqués
    g.parent?.parent?.getWorldPosition(center)
    toCam.copy(camera.position).sub(center).normalize()
    c.copy(v).sub(center)
    const assembled = anim.explode < 0.35
    let facing = 1
    if (assembled && mode !== 'xray') {
      const d = c.dot(toCam)
      facing = THREE.MathUtils.smoothstep(d, -2, 3)
    }
    const o = mode === 'exploded' || mode === 'xray' ? Math.max(facing, THREE.MathUtils.smoothstep(anim.explode, 0.4, 0.8)) : facing
    b.style.opacity = String(o)
    b.style.pointerEvents = o > 0.4 ? 'auto' : 'none'
    b.tabIndex = o > 0.4 ? 0 : -1
  })

  if (!show) return null
  const isSel = selected === meta.id
  return (
    <group ref={group} position={meta.anchor}>
      <Html center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <button
          ref={el}
          type="button"
          className={`hotspot ${isSel ? 'is-selected' : ''} ${PRIMARY.has(meta.id) || MOVEMENT_PRIMARY.has(meta.id) ? '' : 'is-minor'}`}
          aria-label={meta.name[lang]}
          aria-pressed={isSel}
          onClick={(e) => {
            e.stopPropagation()
            const s = useAtelier.getState()
            s.select(s.selected === meta.id ? null : meta.id)
          }}
          onPointerEnter={() => useAtelier.getState().hover(meta.id)}
          onPointerLeave={() => useAtelier.getState().hover(null)}
        >
          <span className="hotspot-dot" aria-hidden />
          <span className="hotspot-label">{meta.name[lang]}</span>
        </button>
      </Html>
    </group>
  )
}
