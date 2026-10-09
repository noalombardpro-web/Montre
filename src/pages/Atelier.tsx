import { useCallback, useState } from 'react'
import { BRANDS, CATEGORIES, WATCH_BY_ID, specList } from '../data/watches'
import { useAtelier } from '../store/useAtelier'
import { useTourSteps } from '../store/useTour'
import { BottomBar, ExperiencesPanel, HelpOverlay, ModeBar, ModelDrawer, PartsIndex, PartsIndexButton, TopBar, useShortcuts } from '../components/ui/AtelierControls'
import { PartPanel } from '../components/ui/PartPanel'
import { Configurator } from '../components/ui/Configurator'
import { TourPanel, tourStep } from '../components/ui/TourPanel'
import { QuizPanel } from '../components/ui/QuizPanel'

/** Atelier : visualiseur 3D plein écran et interface flottante. */
export function Atelier() {
  const watchId = useAtelier((s) => s.watchId)
  const lang = useAtelier((s) => s.lang)
  const selected = useAtelier((s) => s.selected)
  const configOpen = useAtelier((s) => s.configOpen)
  const tour = useAtelier((s) => s.tour)
  const quiz = useAtelier((s) => s.quiz)
  const steps = useTourSteps()
  const [partsOpen, setPartsOpen] = useState(false)
  const togglePartsIndex = useCallback(() => setPartsOpen((o) => !o), [])
  const stepFn = useCallback((d: number) => tourStep(d, steps?.length ?? 1), [steps])
  useShortcuts(togglePartsIndex, stepFn)
  const watch = WATCH_BY_ID[watchId]
  const sheetOpen = !!selected || configOpen || !!tour || quiz
  const specs = specList(watch, lang)

  return (
    <div className="pointer-events-none fixed inset-0">
      <h1 className="sr-only">
        Watch Atelier — {BRANDS[watch.brand].name} {watch.name}
      </h1>
      <TopBar />

      {/* Colonne gauche : modes, expériences, nomenclature */}
      <div className="absolute left-[var(--gutter)] top-28 hidden max-h-[calc(100svh-19rem)] flex-col gap-3 overflow-y-auto scrollbar-none md:flex [@media(max-height:820px)]:max-h-[calc(100svh-14rem)]">
        <ModeBar />
        <ExperiencesPanel />
        <PartsIndexButton open={partsOpen} onClick={togglePartsIndex} />
        <PartsIndex open={partsOpen} onClose={() => setPartsOpen(false)} />
      </div>

      {/* Identité du modèle */}
      <div key={watchId} className={`absolute left-[var(--gutter)] top-24 max-w-md md:top-auto md:bottom-8 md:max-w-[34vw] ${sheetOpen ? 'max-md:hidden' : ''}`} style={{ animation: 'fadeUp 1.1s var(--ease-lux)' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
        <div className="eyebrow">
          {BRANDS[watch.brand].name} · {CATEGORIES[watch.category][lang]}
        </div>
        <div className="display mt-2 text-3xl md:text-5xl [@media(max-height:820px)]:md:text-4xl">{watch.name}</div>
        <p className="mt-2 hidden max-w-sm text-[12.5px] leading-relaxed text-ivory/60 md:block [@media(max-height:900px)]:!hidden">{watch.intro[lang]}</p>
        <dl className="mt-4 hidden grid-cols-4 gap-4 md:grid [@media(max-height:820px)]:!hidden">
          {[specs[0], specs[2], specs[3], specs[5]].map((sp) => (
            <div key={sp.label}>
              <dt className="text-[9px] uppercase tracking-[0.26em] text-muted">{sp.label}</dt>
              <dd className="mt-1 font-serif text-[15px] text-ivory/90">{sp.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Barre inférieure */}
      <div className={`absolute inset-x-3 bottom-3 flex flex-col items-stretch gap-2 md:inset-x-auto md:right-[var(--gutter)] md:bottom-8 md:items-end ${sheetOpen ? 'max-md:hidden' : ''}`}>
        <div className="md:hidden">
          <ModeBar />
        </div>
        <div className="md:hidden">
          <ExperiencesPanel />
        </div>
        <BottomBar />
      </div>

      <PartPanel />
      <Configurator />
      <TourPanel />
      <QuizPanel />
      <ModelDrawer />
      <HelpOverlay />
    </div>
  )
}
