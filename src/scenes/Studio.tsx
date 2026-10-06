import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { anim } from '../store/useAtelier'
import { useDebug } from '../store/useDebug'

/**
 * Studio photo procédural (HDRI généré en temps réel par des « lightformers ») :
 * aucun fichier HDR à télécharger, reflets maîtrisés comme en studio horloger.
 */
export function Studio({ high }: { high: boolean }) {
  const d = useDebug()
  const shadows = useRef<Group>(null)
  useFrame(() => {
    if (shadows.current) shadows.current.visible = anim.explode < 0.15 && anim.movement < 0.5
  })
  return (
    <>
      <Environment resolution={high ? 512 : 256} frames={1} environmentIntensity={d.envIntensity}>
        <color attach="background" args={['#060607']} />
        {/* softbox principale, au-dessus */}
        <Lightformer form="rect" intensity={3.2} color="#fff6ea" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        {/* bandes latérales (reflets allongés sur la carrure et les maillons) */}
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[12, 0.8, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#f3ecdf" position={[6, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[12, 0.6, 1]} />
        {/* face avant douce */}
        <Lightformer form="rect" intensity={0.9} color="#ffffff" position={[0, 0, 7]} scale={[6, 3, 1]} />
        {/* contre-jour chaud */}
        <Lightformer form="ring" intensity={1.6} color="#e9c98f" position={[2, 3, -7]} scale={3} />
        {/* softbox arrière : éclaire le calibre vu par le fond */}
        <Lightformer form="rect" intensity={2.6} color="#fff8ee" position={[-1, 2, -7]} scale={[9, 4, 1]} />
        {/* lueur froide basse */}
        <Lightformer form="rect" intensity={0.5} color="#9fb6d8" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <directionalLight position={[40, 80, 60]} intensity={d.keyLight} color="#fff3e2" />
      <directionalLight position={[-30, 40, -90]} intensity={d.keyLight * 0.8} color="#f4efe6" />
      <ambientLight intensity={0.06} />
      <group ref={shadows}>
        <ContactShadows
          position={[0, -32.5, -18]}
          scale={[120, 120]}
          resolution={high ? 512 : 256}
          blur={2.4}
          far={40}
          opacity={0.65}
          color="#000000"
          frames={high ? Infinity : 1}
        />
      </group>
    </>
  )
}
