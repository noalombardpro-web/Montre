import { useEffect, useState } from 'react'
import { PART_BY_ID } from '../../data/parts'
import { useAtelier } from '../../store/useAtelier'
import { useTourSteps } from '../../store/useTour'
import { IconArrow, IconClose, IconPlay } from './Icons'

/** Avance / recule d'une étape dans la visite en cours. */
export function tourStep(d: number, total: number) {
  const s = useAtelier.getState()
  if (!s.tour) return
  const next = Math.min(Math.max(s.tour.step + d, 0), total - 1)
  s.set({ tour: { ...s.tour, step: next } })
}

/** Panneau de visite guidée : montage pas à pas ou trajet de l'énergie. */
export function TourPanel() {
  const tour = useAtelier((s) => s.tour)
  const lang = useAtelier((s) => s.lang)
  const reduced = useAtelier((s) => s.reducedMotion)
  const steps = useTourSteps()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || !tour || !steps) return
    if (tour.step >= steps.length - 1) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => tourStep(1, steps.length), reduced ? 4000 : 6500)
    return () => clearTimeout(id)
  }, [playing, tour, steps, reduced])
  useEffect(() => {
    if (!tour) setPlaying(false)
  }, [tour])

  if (!tour || !steps) return null
  const st = steps[tour.step]
  if (!st) return null
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const main = PART_BY_ID[st.parts[0]]
  const assembly = tour.id === 'assembly'
  const title = st.title?.[lang] ?? main.name[lang]
  const text = st.text?.[lang] ?? (assembly ? main.assembly?.[lang] : main.howItWorks?.[lang]) ?? ''
  const tools = assembly ? [...new Map(st.parts.flatMap((p) => PART_BY_ID[p].tools ?? []).map((tl) => [tl.fr, tl])).values()] : []
  const pct = ((tour.step + 1) / steps.length) * 100

  return (
    <aside
      aria-label={assembly ? L('Montage pas à pas', 'Step-by-step assembly') : L("Trajet de l'énergie", 'Energy path')}
      className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-30 max-h-[50svh] overflow-y-auto p-6 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:w-[420px] md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="eyebrow">
          {assembly ? L('Montage pas à pas', 'Step-by-step assembly') : L("Trajet de l'énergie", 'Energy path')} · {tour.step + 1}/{steps.length}
        </div>
        <button type="button" onClick={() => useAtelier.getState().startTour(null)} className="-m-2 p-2 text-muted hover:text-ivory" aria-label={L('Quitter la visite', 'Exit tour')}>
          <IconClose />
        </button>
      </div>
      <div className="mt-4 h-px w-full bg-line">
        <div className="h-px bg-gold transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <h2 className="display mt-5 text-[2.1rem] leading-tight" aria-live="polite">
        {title}
      </h2>
      {assembly && (
        <div className="mt-2 flex flex-wrap gap-x-3 text-[11px] text-muted">
          {st.parts.map((p) => (
            <span key={p}>{PART_BY_ID[p].name[lang]}</span>
          ))}
        </div>
      )}
      <p className="mt-4 text-[13.5px] leading-relaxed text-ivory/85">{text}</p>
      {tools.length > 0 && (
        <div className="mt-4">
          <div className="eyebrow mb-2 !text-[9.5px] !text-muted">{L('Outils', 'Tools')}</div>
          <ul className="flex flex-wrap gap-2">
            {tools.map((tl) => (
              <li key={tl.fr} className="border border-line px-2.5 py-1 text-[11.5px] text-ivory/80">
                {tl[lang]}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex items-center gap-2">
        <button type="button" className="chip" onClick={() => tourStep(-1, steps.length)} disabled={tour.step === 0} aria-label={L('Étape précédente', 'Previous step')}>
          <IconArrow dir="left" width={14} height={14} />
        </button>
        <button type="button" className="chip flex flex-1 items-center justify-center gap-2" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
          <IconPlay playing={playing} width={13} height={13} /> {playing ? L('Pause', 'Pause') : L('Lecture auto', 'Autoplay')}
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => (tour.step === steps.length - 1 ? useAtelier.getState().startTour(null) : tourStep(1, steps.length))}
          aria-label={tour.step === steps.length - 1 ? L('Terminer', 'Finish') : L('Étape suivante', 'Next step')}
        >
          {tour.step === steps.length - 1 ? '✓' : <IconArrow width={14} height={14} />}
        </button>
      </div>
    </aside>
  )
}
