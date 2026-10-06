import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PART_BY_ID } from '../data/parts'
import { anim, useAtelier, type Mode } from '../store/useAtelier'
import { landingPose } from './landingKeyframes'

type Pose = { pos: [number, number, number]; target: [number, number, number] }

const POSES: Record<Mode, Pose> = {
  normal: { pos: [48, 16, 128], target: [0, 0, -4] },
  exploded: { pos: [150, 62, 175], target: [0, 0, -6] },
  movement: { pos: [-36, 14, -118], target: [0, 0, -2] },
  xray: { pos: [96, 30, 112], target: [0, 0, -8] },
}

const box = new THREE.Box3()
const sphere = new THREE.Sphere()
const tmp = new THREE.Vector3()
const tmp2 = new THREE.Vector3()

export function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const { scene, size } = useThree()
  const page = useAtelier((s) => s.page)
  const mode = useAtelier((s) => s.mode)
  const selected = useAtelier((s) => s.selected)
  const resetNonce = useAtelier((s) => s.resetNonce)
  const watchId = useAtelier((s) => s.watchId)
  const reduced = useAtelier((s) => s.reducedMotion)
  const lastInteraction = useRef(0)
  const narrow = size.width < 760

  // Réglages des contrôles : inertie douce, zoom borné
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.smoothTime = reduced ? 0.05 : 0.55
    c.draggingSmoothTime = reduced ? 0.02 : 0.14
    c.minDistance = 22
    c.maxDistance = 420
    c.dollyToCursor = false
    c.azimuthRotateSpeed = 0.6
    c.polarRotateSpeed = 0.6
    c.dollySpeed = 0.6
    c.truckSpeed = 1
    c.restThreshold = 0.002
  }, [reduced])

  // Changement de page / mode / désélection : vol vers la pose de référence
  useEffect(() => {
    const c = ref.current
    if (!c || page !== 'atelier' || selected) return
    const p = POSES[mode]
    const k = narrow ? 1.9 : 1
    c.setFocalOffset(0, narrow ? 10 : 0, 0, true)
    c.setLookAt(p.pos[0] * k, p.pos[1] * k, p.pos[2] * k, ...p.target, !reduced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, mode, resetNonce, narrow, selected === null])

  // Sélection : la caméra vole vers la pièce
  useEffect(() => {
    const c = ref.current
    if (!c || page !== 'atelier' || !selected) return
    // laisse une frame aux positions d'éclatement
    const id = requestAnimationFrame(() => {
      const obj = scene.getObjectByName(selected)
      if (!obj) return
      box.setFromObject(obj, true)
      if (box.isEmpty()) return
      box.getBoundingSphere(sphere)
      const meta = PART_BY_ID[selected]
      c.getPosition(tmp)
      c.getTarget(tmp2)
      const dir = tmp.sub(tmp2).normalize()
      // pièce du mouvement vue en assemblé : on passe côté fond
      const behind = sphere.center.z < -0.5 || meta?.group === 'movement'
      if (behind && anim.explode < 0.3 && dir.z > 0) dir.z *= -1
      if (!behind && sphere.center.z > 1 && dir.z < 0) dir.z *= -1
      dir.normalize()
      const dist = THREE.MathUtils.clamp(sphere.radius * (narrow ? 6.2 : 4.8), 42, 260)
      const p = sphere.center.clone().addScaledVector(dir, dist)
      c.setFocalOffset(narrow ? 0 : Math.max(sphere.radius * 0.7, 8), narrow ? Math.max(sphere.radius * 0.9, 9) : 0, 0, !reduced)
      c.setLookAt(p.x, p.y, p.z, sphere.center.x, sphere.center.y, sphere.center.z, !reduced)
    })
    return () => cancelAnimationFrame(id)
  }, [selected, page, scene, reduced, narrow])

  // Transition de modèle : recentrage
  useEffect(() => {
    lastInteraction.current = performance.now()
  }, [watchId])

  useFrame((_, dt) => {
    const c = ref.current
    if (!c) return
    const s = useAtelier.getState()
    if (s.page === 'landing') {
      c.enabled = false
      const pose = landingPose(anim.scroll, narrow)
      c.setLookAt(...pose.pos, ...pose.target, true)
      c.setFocalOffset(...pose.focal, true)
      return
    }
    c.enabled = true
    const idle = performance.now() - lastInteraction.current > 2600
    if (s.autoRotate && !s.selected && idle && !s.reducedMotion && s.sceneReady) {
      c.azimuthAngle += dt * 0.11
    }
  })

  return (
    <CameraControls
      ref={ref}
      makeDefault
      onControlStart={() => (lastInteraction.current = performance.now())}
      onControl={() => (lastInteraction.current = performance.now())}
      onControlEnd={() => (lastInteraction.current = performance.now())}
    />
  )
}
