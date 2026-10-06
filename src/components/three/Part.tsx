import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PART_BY_ID } from '../../data/parts'
import { staggered } from '../../lib/explode'
import { anim, useAtelier } from '../../store/useAtelier'
import { Hotspot } from './Hotspot'
import { dimmed, overrideMaterials, xrayMaterial, wireMaterial } from './overrides'

/** Pièces qui s'effacent en mode « Mouvement » pour dévoiler le calibre. */
const MOVEMENT_FADE = new Set(['bracelet', 'clasp'])
const MOVEMENT_LIFT = new Set(['caseback'])

/**
 * Enveloppe d'une pièce : nœud nommé, déplacement d'éclatement, sélection,
 * isolation (transparence des autres pièces), rayons X / fil de fer, hotspot.
 */
export function Part({ id, children }: { id: string; children: ReactNode }) {
  const meta = PART_BY_ID[id]
  const ref = useRef<THREE.Group>(null)
  const mode = useAtelier((s) => s.mode)
  const wireframe = useAtelier((s) => s.wireframe)
  const selected = useAtelier((s) => s.selected)
  const isolate = useAtelier((s) => s.isolate)
  const page = useAtelier((s) => s.page)

  useFrame(() => {
    const g = ref.current
    if (!g || !meta) return
    let p = staggered(anim.explode, meta.order)
    if (MOVEMENT_LIFT.has(id)) p = Math.max(p, anim.movement)
    const [x, y, z] = meta.explode
    g.position.set(x * p, y * p, z * p)
    if (MOVEMENT_LIFT.has(id)) g.visible = anim.movement < 0.97
  })

  // Application de l'état visuel après chaque rendu (les matériaux d'origine peuvent avoir changé).
  useLayoutEffect(() => {
    const g = ref.current
    if (!g) return
    const isSel = selected === id
    let kind: 'normal' | 'dim' | 'xray' | 'wire' = 'normal'
    if (isolate && selected && !isSel) kind = 'dim'
    else if (mode === 'xray' && !isSel) kind = wireframe ? 'wire' : 'xray'
    else if (wireframe && !isSel) kind = 'wire'
    if (kind === 'normal' && mode === 'movement' && MOVEMENT_FADE.has(id)) kind = 'dim'
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const current = mesh.material as THREE.Material
      if (!overrideMaterials.has(current)) mesh.userData.orig = current
      const orig = mesh.userData.orig as THREE.Material
      mesh.material =
        kind === 'dim' ? dimmed(orig, mode === 'movement' ? 0.05 : 0.06) : kind === 'xray' ? xrayMaterial : kind === 'wire' ? wireMaterial : orig
      mesh.castShadow = kind === 'normal'
    })
  })

  const interactive = page === 'atelier'
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    const s = useAtelier.getState()
    s.select(s.selected === id ? null : id)
  }
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    useAtelier.getState().hover(id)
  }
  const onOut = () => {
    if (!interactive) return
    if (useAtelier.getState().hovered === id) useAtelier.getState().hover(null)
  }

  return (
    <group ref={ref} name={id} userData={{ partId: id }} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {children}
      {meta && <Hotspot meta={meta} />}
    </group>
  )
}
