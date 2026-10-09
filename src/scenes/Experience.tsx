import { lazy, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useAtelier } from '../store/useAtelier'
import { THUMB_MODE } from '../lib/env'
import { Studio } from './Studio'
import { CameraRig } from './CameraRig'
import { WatchStage } from './WatchStage'
import { Effects } from './Effects'
import { ReadyGate, Screenshot } from './SceneUtils'
import { MovementClock } from '../models/procedural/MovementParts'
import { TourDriver } from './TourDriver'
import { CutPlane } from './CutPlane'

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
      frameloop={page === 'collection' ? 'never' : 'always'}
      className={`scene-canvas ${page === 'landing' ? 'is-landing' : ''} ${ready ? 'is-ready' : ''}`}
      dpr={THUMB_MODE ? [1, 1] : [1, dpr]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: THUMB_MODE, stencil: false }}
      camera={{ fov: 30, near: 2, far: 2000, position: [40, 12, 128] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THUMB_MODE ? THREE.AgXToneMapping : THREE.NoToneMapping
        THUMB_MODE ? gl.setClearAlpha(0) : gl.setClearColor('#030304')
      }}
      onPointerMissed={() => {
        const s = useAtelier.getState()
        if (s.page === 'atelier' && s.selected && !s.isolate) s.select(null)
      }}
      aria-label="Vue 3D interactive de la montre"
      role="img"
    >
      {!THUMB_MODE && <color attach="background" args={['#08080a']} />}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(high ? 2 : 1.5, d + 0.25))}
        onFallback={() => useAtelier.getState().set({ quality: 'low' })}
      />
      <AdaptiveEvents />
      <MovementClock />
      <TourDriver />
      <CutPlane />
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
