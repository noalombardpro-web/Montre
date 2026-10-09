import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PART_BY_ID } from '../../data/parts'
import { staggered } from '../../lib/explode'
import { anim, useAtelier } from '../../store/useAtelier'
import { useTourSteps } from '../../store/useTour'
import { Hotspot } from './Hotspot'
import { dimmed, overrideMaterials, xrayMaterial, wireMaterial } from './overrides'

/** Pièces qui s'effacent en mode « Mouvement » pour dévoiler le calibre. */
const MOVEMENT_FADE = new Set(['bracelet', 'clasp'])
const MOVEMENT_LIFT = new Set(['caseback'])

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Enveloppe d'une pièce : nœud nommé, déplacement d'éclatement, sélection,
 * isolation (transparence des autres pièces), rayons X / fil de fer, visites guidées, hotspot.
 */
export function Part({ id, children }: { id: string; children: ReactNode }) {
  const meta = PART_BY_ID[id]
  const ref = useRef<THREE.Group>(null)
  const mode = useAtelier((s) => s.mode)
  const wireframe = useAtelier((s) => s.wireframe)
  const selected = useAtelier((s) => s.selected)
  const isolate = useAtelier((s) => s.isolate)
  const page = useAtelier((s) => s.page)
  const tour = useAtelier((s) => s.tour)
  const quiz = useAtelier((s) => s.quiz)
  const steps = useTourSteps()

  // Rang de la pièce dans la visite en cours
  const stepIndex = useMemo(() => (steps ? steps.findIndex((s) => s.parts.includes(id)) : -1), [steps, id])
  const inCurrentStep = !!tour && !!steps && !!steps[tour.step]?.parts.includes(id)

  useFrame(() => {
    const g = ref.current
    if (!g || !meta) return
    const [x, y, z] = meta.explode
    // Montage pas à pas : les pièces apparaissent dans l'ordre et « volent » à leur place
    if (tour?.id === 'assembly' && steps) {
      const visible = stepIndex >= 0 && stepIndex <= tour.step
      g.visible = visible
      const p = stepIndex === tour.step ? (1 - easeOut(anim.tourT)) * 0.9 : 0
      g.position.set(x * p, y * p, z * p)
      return
    }
    let p = staggered(anim.explode, meta.order)
    if (MOVEMENT_LIFT.has(id)) p = Math.max(p, anim.movement)
    g.position.set(x * p, y * p, z * p)
    g.visible = MOVEMENT_LIFT.has(id) ? anim.movement < 0.97 : true
  })

  // Application de l'état visuel après chaque rendu (les matériaux d'origine peuvent avoir changé).
  useLayoutEffect(() => {
    const g = ref.current
    if (!g) return
    const isSel = selected === id
    let kind: 'normal' | 'dim' | 'xray' | 'wire' = 'normal'
    let opacity = mode === 'movement' ? 0.05 : 0.06
    if (tour?.id === 'energy') {
      kind = inCurrentStep ? 'normal' : 'dim'
      opacity = meta?.group === 'movement' ? 0.16 : 0.05
    } else if ((isolate || quiz) && selected && !isSel) kind = 'dim'
    else if (mode === 'xray' && !isSel) kind = wireframe ? 'wire' : 'xray'
    else if (wireframe && !isSel) kind = 'wire'
    if (kind === 'normal' && mode === 'movement' && MOVEMENT_FADE.has(id)) kind = 'dim'
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const current = mesh.material as THREE.Material
      if (!overrideMaterials.has(current)) mesh.userData.orig = current
      const orig = mesh.userData.orig as THREE.Material
      mesh.material = kind === 'dim' ? dimmed(orig, opacity) : kind === 'xray' ? xrayMaterial : kind === 'wire' ? wireMaterial : orig
      mesh.castShadow = kind === 'normal'
    })
  })

  const interactive = page === 'atelier' && !tour && !quiz
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
    if (useAtelier.getState().hovered === id) useAtelier.getState().hover(null)
  }

  return (
    <group ref={ref} name={id} userData={{ partId: id }} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {children}
      {meta && <Hotspot meta={meta} />}
    </group>
  )
}
