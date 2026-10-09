import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAtelier } from '../store/useAtelier'

const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)

/**
 * Vue en coupe : un plan de découpe global (renderer.clippingPlanes) tranche la montre
 * selon l'axe 3 h – 9 h et révèle l'empilement cadran / mouvement / fond.
 */
export function CutPlane() {
  const cut = useAtelier((s) => s.cut)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (cut === null) {
      gl.clippingPlanes = []
    } else {
      plane.constant = cut
      gl.clippingPlanes = [plane]
    }
    invalidate()
  }, [cut, gl, invalidate])
  useEffect(
    () => () => {
      gl.clippingPlanes = []
    },
    [gl],
  )
  return null
}
