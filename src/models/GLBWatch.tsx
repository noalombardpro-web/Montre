import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Part } from '../components/three/Part'
import { PART_BY_ID } from '../data/parts'
import { useAtelier } from '../store/useAtelier'

const TAU = Math.PI * 2

/**
 * Charge un modèle GLB dont les nœuds sont nommés selon les `id` de parts.json
 * (ex. : un export de `npm run export:glb`, ou un modèle CC0/CC-BY renommé).
 * Chaque nœud reconnu devient une pièce interactive (éclatement, hotspot, isolation).
 * Unités : millimètres, +Z = cadran, +Y = 12 h. Décodeur Meshopt embarqué ;
 * Draco chargé à la demande depuis le CDN de drei si le fichier l'utilise.
 */
export function GLBWatch({ url }: { url: string }) {
  const { scene } = useGLTF(url, true, true)
  const nodes = useMemo(() => {
    const root = scene.clone(true)
    const found: THREE.Object3D[] = []
    root.traverse((o) => {
      if (PART_BY_ID[o.name] && !found.some((f) => isAncestor(f, o))) found.push(o)
    })
    found.forEach((n) => n.parent?.remove(n))
    return { found, rest: root }
  }, [scene])

  useEffect(() => {
    useAtelier.getState().set({ staged: true })
  }, [nodes])

  // Aiguilles à l'heure réelle : le premier enfant de chaque aiguille est son pivot
  const pivots = useMemo(() => {
    const get = (id: string) => nodes.found.find((n) => n.name === id)?.children[0] ?? null
    return { h: get('hourHand'), m: get('minuteHand'), s: get('secondsHand') }
  }, [nodes])
  useFrame(() => {
    const now = new Date()
    const sec = now.getSeconds() + Math.floor(now.getMilliseconds() / 125) / 8
    const min = now.getMinutes() + sec / 60
    const hour = (now.getHours() % 12) + min / 60
    if (pivots.h) pivots.h.rotation.z = -(hour / 12) * TAU
    if (pivots.m) pivots.m.rotation.z = -(min / 60) * TAU
    if (pivots.s) pivots.s.rotation.z = -(sec / 60) * TAU
  })

  return (
    <group name="watch-glb">
      <primitive object={nodes.rest} />
      {nodes.found.map((n) => (
        <Part key={n.uuid} id={n.name}>
          <primitive object={n} />
        </Part>
      ))}
    </group>
  )
}

function isAncestor(a: THREE.Object3D, b: THREE.Object3D) {
  let p = b.parent
  while (p) {
    if (p === a) return true
    p = p.parent
  }
  return false
}
