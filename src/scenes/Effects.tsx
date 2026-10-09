import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useFrame } from '@react-three/fiber'
import { useDebug } from '../store/useDebug'
import { POSTER_MODE, THUMB_MODE } from '../lib/env'

/** Post-traitement : bloom léger (indices luminescents), tonemapping AgX, vignettage. */
export function Effects({ high }: { high: boolean }) {
  const d = useDebug()
  if (THUMB_MODE) return <ThumbRender />
  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={d.bloom} luminanceThreshold={d.bloomThreshold} luminanceSmoothing={0.15} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette eskil={false} offset={0.28} darkness={POSTER_MODE ? 0 : d.vignette} />
    </EffectComposer>
  )
}

/**
 * Mode vignette : sans post-traitement, on dessine nous-mêmes. Toute priorité > 0 dans
 * useFrame désactive le rendu automatique de R3F ; celui-ci doit donc être explicite.
 */
function ThumbRender() {
  useFrame(({ gl, scene, camera }) => gl.render(scene, camera), 1)
  return null
}
