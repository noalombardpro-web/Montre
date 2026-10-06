import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useDebug } from '../store/useDebug'
import { POSTER_MODE } from '../lib/env'

/** Post-traitement : bloom léger (indices luminescents), tonemapping AgX, vignettage. */
export function Effects({ high }: { high: boolean }) {
  const d = useDebug()
  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={d.bloom} luminanceThreshold={d.bloomThreshold} luminanceSmoothing={0.15} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette eskil={false} offset={0.28} darkness={POSTER_MODE ? 0 : d.vignette} />
    </EffectComposer>
  )
}
