import { useEffect } from 'react'
import { useAtelier } from '../../store/useAtelier'
import { WATCH_BY_ID } from '../../data/watches'

/**
 * Tic-tac synthétisé (Web Audio) : courtes salves de bruit filtré, alternance « tic » / « tac »
 * à la cadence du balancier (8 alternances par seconde ; ralenti ×1/8 en mode Mouvement).
 * Programmation anticipée pour une cadence stable, indépendante du rendu.
 */
export function TickSound() {
  const sound = useAtelier((s) => s.sound)
  useEffect(() => {
    if (!sound) return
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    void ctx.resume()
    // bruit blanc partagé
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6)
    const master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    let next = ctx.currentTime + 0.05
    let beat = 0
    const click = (t: number, tic: boolean) => {
      const src = ctx.createBufferSource()
      src.buffer = buf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = tic ? 4200 : 3300
      bp.Q.value = 6
      const g = ctx.createGain()
      g.gain.setValueAtTime(tic ? 0.9 : 0.7, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.018)
      src.connect(bp).connect(g).connect(master)
      src.start(t)
    }
    const id = window.setInterval(() => {
      const s = useAtelier.getState()
      const glide = WATCH_BY_ID[s.watchId]?.specs.movement === 'springdrive'
      const rate = glide ? 0 : s.mode === 'movement' && s.slowMo ? 1 : 8
      if (!rate) {
        next = ctx.currentTime + 0.05
        return
      }
      while (next < ctx.currentTime + 0.12) {
        click(next, beat % 2 === 0)
        beat++
        next += 1 / rate
      }
    }, 25)
    return () => {
      clearInterval(id)
      void ctx.close()
    }
  }, [sound])
  return null
}
