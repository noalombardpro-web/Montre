import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useAtelier } from '../store/useAtelier'
import { Studio } from './Studio'
import { CameraRig } from './CameraRig'
import { WatchStage } from './WatchStage'
import { Effects } from './Effects'
import { ReadyGate, Screenshot } from './SceneUtils'
import { MovementClock } from '../models/procedural/MovementParts'

const DevTools = import.meta.env.DEV ? lazy(() => import('../debug/DevTools')) : () => null

/** Canvas WebGL unique, partagé entre la landing et l'atelier (transitions continues). */
export default function Experience() {
  const quality = useAtelier((s) => s.quality)
  const page = useAtelier((s) => s.page)
  const ready = useAtelier((s) => s.sceneReady)
  const high = quality === 'high'
  const [dpr, setDpr] = useState(high ? 1.75 : 1)
  return (
    <Canvas
      className={`scene-canvas ${page === 'landing' ? 'is-landing' : ''} ${ready ? 'is-ready' : ''}`}
      dpr={[1, dpr]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 30, near: 2, far: 2000, position: [40, 12, 128] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping
        gl.setClearColor('#08080a')
      }}
      onPointerMissed={() => {
        const s = useAtelier.getState()
        if (s.page === 'atelier' && s.selected && !s.isolate) s.select(null)
      }}
      aria-label="Vue 3D interactive de la montre"
      role="img"
    >
      <color attach="background" args={['#08080a']} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(high ? 2 : 1.5, d + 0.25))}
        onFallback={() => useAtelier.getState().set({ quality: 'low' })}
      />
      <AdaptiveEvents />
      <MovementClock />
      <Suspense fallback={null}>
        <Studio high={high} />
        <WatchStage high={high} />
        <ReadyGate />
      </Suspense>
      <CameraRig />
      <Effects high={high} />
      <Screenshot />
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
    </Canvas>
  )
}
