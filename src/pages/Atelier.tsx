import { useCallback, useState } from 'react'
import { WATCH_BY_ID } from '../data/watches'
import { useAtelier } from '../store/useAtelier'
import { BottomBar, HelpOverlay, ModeBar, PartsIndex, PartsIndexButton, TopBar, useShortcuts } from '../components/ui/AtelierControls'
import { PartPanel } from '../components/ui/PartPanel'
import { Configurator } from '../components/ui/Configurator'

/** Atelier : visualiseur 3D plein écran et interface flottante. */
export function Atelier() {
  const watchId = useAtelier((s) => s.watchId)
  const lang = useAtelier((s) => s.lang)
  const selected = useAtelier((s) => s.selected)
  const configOpen = useAtelier((s) => s.configOpen)
  const [partsOpen, setPartsOpen] = useState(false)
  const togglePartsIndex = useCallback(() => setPartsOpen((o) => !o), [])
  useShortcuts(togglePartsIndex)
  const watch = WATCH_BY_ID[watchId]
  const sheetOpen = !!selected || configOpen

  return (
    <div className="pointer-events-none fixed inset-0">
      <h1 className="sr-only">Watch Atelier — {watch.name}</h1>
      <TopBar />

      {/* Colonne gauche : modes + nomenclature */}
      <div className="absolute left-[var(--gutter)] top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <ModeBar />
        <PartsIndexButton open={partsOpen} onClick={togglePartsIndex} />
        <PartsIndex open={partsOpen} onClose={() => setPartsOpen(false)} />
      </div>

      {/* Identité du modèle */}
      <div key={watchId} className={`absolute left-[var(--gutter)] top-20 max-w-sm md:top-auto md:bottom-10 ${sheetOpen ? 'max-md:hidden' : ''}`} style={{ animation: 'fadeUp 1.1s var(--ease-lux)' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
        <div className="eyebrow">{watch.family[lang]}</div>
        <div className="display mt-2 text-3xl md:text-6xl">{watch.name}</div>
        <dl className="mt-4 hidden grid-cols-4 gap-5 md:grid">
          {watch.specs.map((sp) => (
            <div key={sp.label.fr}>
              <dt className="text-[9px] uppercase tracking-[0.26em] text-muted">{sp.label[lang]}</dt>
              <dd className="mt-1 font-serif text-[15px] text-ivory/90">{sp.value[lang]}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Barre inférieure */}
      <div className={`absolute inset-x-3 bottom-3 flex flex-col items-stretch gap-2 md:inset-x-auto md:right-[var(--gutter)] md:bottom-8 md:items-end ${sheetOpen ? 'max-md:hidden' : ''}`}>
        <div className="md:hidden">
          <ModeBar />
        </div>
        <BottomBar />
      </div>

      <PartPanel />
      <Configurator />
      <HelpOverlay />
    </div>
  )
}
