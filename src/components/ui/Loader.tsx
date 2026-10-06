import { useEffect, useState } from 'react'
import { useAtelier } from '../../store/useAtelier'
import { t } from '../../data/i18n'

/** Écran de chargement : cadran stylisé dont l'aiguille progresse jusqu'à la scène prête. */
export function Loader() {
  const ready = useAtelier((s) => s.sceneReady)
  const lang = useAtelier((s) => s.lang)
  const [progress, setProgress] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = () => {
      const el = (performance.now() - start) / 1000
      // progression asymptotique tant que la scène n'est pas prête
      setProgress((p) => (ready ? Math.min(1, p + 0.04) : Math.min(0.92, 1 - Math.exp(-el * 0.9))))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready])

  const done = ready && progress >= 1
  useEffect(() => {
    if (!done) return
    const id = setTimeout(() => setGone(true), 1100)
    return () => clearTimeout(id)
  }, [done])

  if (gone) return null
  const angle = progress * 360
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!done}
      className={`fixed inset-0 z-[150] grid place-items-center bg-ink transition-opacity duration-1000 ${done ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-8">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#c9a96a"
            strokeWidth="1"
            strokeDasharray={`${progress * 339.3} 339.3`}
            transform="rotate(-90 60 60)"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="60" y1="12" x2="60" y2={i % 3 === 0 ? 20 : 16} stroke="#e3cf9f" strokeOpacity={0.6} transform={`rotate(${i * 30} 60 60)`} />
          ))}
          <line x1="60" y1="60" x2="60" y2="24" stroke="#ece8e1" strokeWidth="1.2" transform={`rotate(${angle} 60 60)`} />
          <line x1="60" y1="60" x2="60" y2="38" stroke="#c9a96a" strokeWidth="2" transform={`rotate(${angle / 12} 60 60)`} />
          <circle cx="60" cy="60" r="2.5" fill="#c9a96a" />
        </svg>
        <div className="text-center">
          <div className="display text-3xl text-ivory">Watch Atelier</div>
          <div className="eyebrow mt-3">
            {t('loading', lang)} · {Math.round(progress * 100)}%
          </div>
        </div>
      </div>
    </div>
  )
}
