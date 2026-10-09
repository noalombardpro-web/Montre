import { useMemo } from 'react'
import { partsFor } from '../data/parts'
import { resolveSteps, TOURS, type TourStep } from '../data/tours'
import { WATCH_BY_ID } from '../data/watches'
import { useAtelier } from './useAtelier'

/** Étapes de la visite en cours pour la montre affichée (ou null). */
export function useTourSteps(): TourStep[] | null {
  const tour = useAtelier((s) => s.tour?.id ?? null)
  const watchId = useAtelier((s) => s.watchId)
  const cfg = useAtelier((s) => s.configs[s.watchId])
  return useMemo(() => {
    if (!tour) return null
    const present = new Set(partsFor(WATCH_BY_ID[watchId], cfg).map((p) => p.id))
    return resolveSteps(TOURS[tour], present)
  }, [tour, watchId, cfg])
}
