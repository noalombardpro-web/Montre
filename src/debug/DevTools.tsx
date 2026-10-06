import { useEffect } from 'react'
import { useControls } from 'leva'
import { useThree } from '@react-three/fiber'
import { DEBUG_DEFAULTS, useDebugStore } from '../store/useDebug'
import { exposeExporter } from './exportGlb'

/** Panneau Leva — chargé uniquement en développement (absent du build de production). */
export default function DevTools() {
  const values = useControls('Rendu', {
    envIntensity: { value: DEBUG_DEFAULTS.envIntensity, min: 0, max: 3 },
    keyLight: { value: DEBUG_DEFAULTS.keyLight, min: 0, max: 4 },
    bloom: { value: DEBUG_DEFAULTS.bloom, min: 0, max: 3 },
    bloomThreshold: { value: DEBUG_DEFAULTS.bloomThreshold, min: 0, max: 1.5 },
    vignette: { value: DEBUG_DEFAULTS.vignette, min: 0, max: 1 },
  })
  useEffect(() => {
    useDebugStore.getState().set(values)
  }, [values])
  const scene = useThree((st) => st.scene)
  const controls = useThree((st) => st.controls) as unknown as Parameters<typeof exposeExporter>[1]
  useEffect(() => exposeExporter(scene, controls), [scene, controls])
  return null
}
