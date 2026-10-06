import { create } from 'zustand'

/** Paramètres de réglage fin (pilotés par Leva en développement uniquement). */
export interface DebugValues {
  envIntensity: number
  keyLight: number
  bloom: number
  bloomThreshold: number
  vignette: number
  exposure: number
}

export const DEBUG_DEFAULTS: DebugValues = {
  envIntensity: 1,
  keyLight: 0.6,
  bloom: 0.55,
  bloomThreshold: 0.92,
  vignette: 0.55,
  exposure: 1,
}

export const useDebugStore = create<DebugValues & { set: (p: Partial<DebugValues>) => void }>((set) => ({
  ...DEBUG_DEFAULTS,
  set: (p) => set(p),
}))

export const useDebug = () => useDebugStore()
