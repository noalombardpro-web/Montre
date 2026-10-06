import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAtelier } from '../store/useAtelier'

/** Pré-compile les shaders puis signale que la scène est prête (fin de l'écran de chargement). */
export function ReadyGate() {
  const { gl, scene, camera } = useThree()
  const frames = useRef(0)
  const compiled = useRef(false)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await gl.compileAsync(scene, camera)
      } catch {
        /* compilation paresseuse en repli */
      }
      if (!cancelled) compiled.current = true
    }
    const id = setTimeout(run, 50)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [gl, scene, camera])
  useFrame(() => {
    if (!compiled.current || useAtelier.getState().sceneReady) return
    frames.current++
    if (frames.current > 6) useAtelier.getState().set({ sceneReady: true })
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
