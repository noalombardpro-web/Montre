import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type * as THREE from 'three'
import { Part } from '../components/three/Part'
import { PART_BY_ID } from '../data/parts'

/**
 * Charge un modèle GLB dont les nœuds sont nommés selon les `id` de parts.json
 * (ex. : un export de `npm run export:glb`, ou un modèle CC0/CC-BY renommé).
 * Chaque nœud reconnu devient une pièce interactive (éclatement, hotspot, isolation).
 * Décodeur Meshopt embarqué ; Draco chargé à la demande depuis le CDN de drei.
 */
export function GLBWatch({ url }: { url: string }) {
  const { scene } = useGLTF(url, true, true)
  const nodes = useMemo(() => {
    const root = scene.clone(true)
    const found: THREE.Object3D[] = []
    root.traverse((o) => {
      if (PART_BY_ID[o.name] && !found.some((f) => isAncestor(f, o))) found.push(o)
    })
    const rest = root
    found.forEach((n) => n.parent?.remove(n))
    return { found, rest }
  }, [scene])
  return (
    <group>
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
