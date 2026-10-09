import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { anim, useAtelier } from '../store/useAtelier'
import { useTourSteps } from '../store/useTour'

/** Anime l'entrée de chaque étape de visite et règle le ralenti de l'échappement. */
export function TourDriver() {
  const tour = useAtelier((s) => s.tour)
  const steps = useTourSteps()
  useEffect(() => {
    anim.tourT = 0
    const step = tour && steps ? steps[tour.step] : null
    if (tour?.id === 'energy') useAtelier.getState().set({ slowMo: !!step?.slow })
  }, [tour, steps])
  useFrame((_, dt) => {
    const reduced = useAtelier.getState().reducedMotion
    anim.tourT = Math.min(1, anim.tourT + dt / (reduced ? 0.05 : 1.6))
  })
  return null
}
