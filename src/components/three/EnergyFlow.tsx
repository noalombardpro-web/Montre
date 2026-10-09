import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POS } from '../../models/procedural/MovementParts'
import { useAtelier } from '../../store/useAtelier'

/**
 * Flux d'énergie : un tube lumineux parcouru d'impulsions dorées relie le barillet,
 * le rouage, l'échappement et le balancier. Visible pendant la visite « trajet de l'énergie ».
 */
export function EnergyFlow() {
  const tour = useAtelier((s) => s.tour?.id)
  const { mesh, mat } = useMemo(() => {
    const pts = [POS.barrel, POS.center, POS.third, POS.fourth, POS.escape, POS.pallet, POS.balance].map(
      ([x, y]) => new THREE.Vector3(x, y, -2.9),
    )
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2)
    const geo = new THREE.TubeGeometry(curve, 240, 0.32, 8, false)
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#ffcf73') } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float pulse = pow(0.5 + 0.5 * sin((vUv.x * 18.0 - uTime * 3.0) * 6.2831), 6.0);
          float a = 0.18 + pulse * 0.82;
          gl_FragColor = vec4(uColor * (0.6 + pulse * 2.4), a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.renderOrder = 10
    return { mesh, mat }
  }, [])
  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
    mesh.visible = tour === 'energy'
  })
  return <primitive object={mesh} />
}
