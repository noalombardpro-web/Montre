import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { pendingJobs } from '../lib/scheduler'
import { useAtelier } from '../store/useAtelier'

/**
 * Signale que la scène est prête (fin de l'écran de chargement) : toutes les pièces montées
 * (shaders compilés au fil des étapes), puis quelques frames rendues.
 */
export function ReadyGate() {
  const frames = useRef(0)
  const t0 = useRef(performance.now())
  useFrame(() => {
    const s = useAtelier.getState()
    if (s.sceneReady || !s.staged) return
    frames.current++
    if (frames.current > 3 && (pendingJobs() === 0 || performance.now() - t0.current > 6000)) s.set({ sceneReady: true })
  })
  return null
}

/** Capture PNG du canvas, juste après le rendu du composer (priorité supérieure). */
export function Screenshot() {
  const nonce = useAtelier((s) => s.screenshotNonce)
  const pending = useRef(false)
  const { gl } = useThree()
  useEffect(() => {
    if (nonce > 0) pending.current = true
  }, [nonce])
  useFrame(() => {
    if (!pending.current) return
    pending.current = false
    const url = gl.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    const s = useAtelier.getState()
    a.href = url
    a.download = `watch-atelier-${s.watchId}-${s.mode}-${Date.now()}.png`
    a.click()
  }, 2)
  return null
}
