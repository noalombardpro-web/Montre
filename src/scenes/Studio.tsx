import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { anim, useAtelier } from '../store/useAtelier'
import { useDebug } from '../store/useDebug'
import { braceletBottom } from '../models/procedural/Bracelet'
import { WATCH_BY_ID } from '../data/watches'

/**
 * Studio photo procédural (HDRI généré en temps réel par des « lightformers ») :
 * aucun fichier HDR à télécharger, reflets maîtrisés comme en studio horloger.
 */
export function Studio({ high }: { high: boolean }) {
  const d = useDebug()
  const shadows = useRef<THREE.Group>(null)
  const keys = useRef<THREE.DirectionalLight[]>([])
  const scene = useThree((st) => st.scene)
  const wrist = useAtelier((st) => st.wrist)
  const watchId = useAtelier((st) => st.watchId)
  const scale = (WATCH_BY_ID[watchId]?.style.diameter ?? 40) / 40
  const floorY = braceletBottom(wrist) * scale
  useFrame((_, dt) => {
    const st = useAtelier.getState()
    if (shadows.current) shadows.current.visible = anim.explode < 0.15 && anim.movement < 0.5 && !st.tour && !st.night
    // Mode nuit : on éteint progressivement le studio, seule la luminescence reste
    const target = st.night ? 0.03 : d.envIntensity
    scene.environmentIntensity = THREE.MathUtils.damp(scene.environmentIntensity ?? 1, target, 3, dt)
    keys.current.forEach((l, i) => {
      if (l) l.intensity = THREE.MathUtils.damp(l.intensity, st.night ? 0 : d.keyLight * (i ? 0.8 : 1), 3, dt)
    })
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
        <Lightformer form="rect" intensity={0.35} color="#ffffff" position={[3, 2, 7]} scale={[3, 1.5, 1]} />
        {/* contre-jour chaud */}
        <Lightformer form="ring" intensity={1.6} color="#e9c98f" position={[2, 3, -7]} scale={3} />
        {/* softbox arrière : éclaire le calibre vu par le fond */}
        <Lightformer form="rect" intensity={1.8} color="#fff8ee" position={[-1, 2, -7]} scale={[8, 3.5, 1]} />
        {/* lueur froide basse */}
        <Lightformer form="rect" intensity={0.5} color="#9fb6d8" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <directionalLight ref={(l) => void (l && (keys.current[0] = l))} position={[40, 80, 60]} intensity={d.keyLight} color="#fff3e2" />
      <directionalLight ref={(l) => void (l && (keys.current[1] = l))} position={[-30, 40, -90]} intensity={d.keyLight * 0.8} color="#f4efe6" />
      <ambientLight intensity={0.06} />
      <group ref={shadows}>
        <ContactShadows
          key={`${wrist}-${watchId}`}
          position={[0, floorY - 0.8, -18 * scale]}
          scale={[160, 160]}
          resolution={high ? 512 : 256}
          blur={2.4}
          far={50}
          opacity={0.65}
          color="#000000"
          frames={high ? Infinity : 1}
        />
      </group>
    </>
  )
}
