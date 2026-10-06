import { BRACELETS, DIAL_COLORS, METALS, WATCH_BY_ID, type BraceletId, type MetalId } from '../../data/watches'
import { t } from '../../data/i18n'
import { useAtelier } from '../../store/useAtelier'
import { IconClose } from './Icons'

const METAL_SWATCH: Record<MetalId, string> = {
  steel: 'linear-gradient(135deg,#f1f2f4,#9a9ea6 55%,#e4e6ea)',
  yellow: 'linear-gradient(135deg,#fbe3a4,#c99a3c 55%,#f5d58a)',
  rose: 'linear-gradient(135deg,#f6d2c2,#c08068 55%,#efc0aa)',
  twotone: 'linear-gradient(135deg,#f1f2f4 0 48%,#d9ae55 52% 100%)',
}

function Group({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="flex w-full items-baseline justify-between">
        <span className="eyebrow !text-[9.5px] !text-muted">{label}</span>
      </legend>
      <div className="mb-3 mt-1 font-serif text-lg text-ivory">{value}</div>
      {children}
    </fieldset>
  )
}

/** Configurateur temps réel : cadran, lunette, bracelet, métal. */
export function Configurator() {
  const open = useAtelier((s) => s.configOpen)
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const cfg = useAtelier((s) => s.configs[s.watchId])
  const set = useAtelier((s) => s.setConfig)
  const selected = useAtelier((s) => s.selected)
  if (!open || selected) return null
  const watch = WATCH_BY_ID[watchId]
  const bezel = watch.bezels.find((b) => b.id === cfg.bezel) ?? watch.bezels[0]

  return (
    <aside
      aria-label={t('configure', lang)}
      className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-30 max-h-[55svh] overflow-y-auto p-6 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:max-h-[calc(100svh-8rem)] md:w-[340px] md:p-7"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="eyebrow">{t('configure', lang)}</div>
          <div className="display mt-2 text-3xl">{watch.name}</div>
        </div>
        <button
          type="button"
          onClick={() => useAtelier.getState().toggle('configOpen')}
          className="-m-2 p-2 text-muted hover:text-ivory"
          aria-label={t('close', lang)}
        >
          <IconClose />
        </button>
      </div>
      <div className="space-y-6">
        <Group label={t('dial', lang)} value={DIAL_COLORS[cfg.dial].label[lang]}>
          <div role="radiogroup" aria-label={t('dial', lang)} className="flex gap-3">
            {watch.dials.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={cfg.dial === d}
                aria-label={DIAL_COLORS[d].label[lang]}
                onClick={() => set({ dial: d })}
                className={`h-10 w-10 rounded-full border transition duration-500 ${cfg.dial === d ? 'scale-110 border-champagne' : 'border-line hover:border-white/40'}`}
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${DIAL_COLORS[d].base}aa, ${DIAL_COLORS[d].base} 55%, #000 140%)`,
                  boxShadow: cfg.dial === d ? '0 0 0 3px #08080a, 0 0 0 4px #e3cf9f' : undefined,
                }}
              />
            ))}
          </div>
        </Group>
        <Group label={t('bezel', lang)} value={bezel.label[lang]}>
          <div role="radiogroup" aria-label={t('bezel', lang)} className="flex flex-wrap gap-2">
            {watch.bezels.map((b) => (
              <button key={b.id} type="button" role="radio" aria-checked={cfg.bezel === b.id} className="chip" onClick={() => set({ bezel: b.id })}>
                {b.insert && <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: b.insert }} />}
                {b.label[lang]}
              </button>
            ))}
          </div>
        </Group>
        <Group label={t('bracelet', lang)} value={BRACELETS[cfg.bracelet].desc[lang]}>
          <div role="radiogroup" aria-label={t('bracelet', lang)} className="flex gap-2">
            {(Object.keys(BRACELETS) as BraceletId[]).map((b) => (
              <button key={b} type="button" role="radio" aria-checked={cfg.bracelet === b} className="chip" onClick={() => set({ bracelet: b })}>
                {BRACELETS[b].label[lang]}
              </button>
            ))}
          </div>
        </Group>
        <Group label={t('metal', lang)} value={METALS[cfg.metal].label[lang]}>
          <div role="radiogroup" aria-label={t('metal', lang)} className="grid grid-cols-4 gap-3">
            {(Object.keys(METALS) as MetalId[]).map((mt) => (
              <button
                key={mt}
                type="button"
                role="radio"
                aria-checked={cfg.metal === mt}
                onClick={() => set({ metal: mt })}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className={`h-9 w-9 rounded-full border transition duration-500 ${cfg.metal === mt ? 'scale-110 border-champagne' : 'border-line group-hover:border-white/40'}`}
                  style={{ background: METAL_SWATCH[mt], boxShadow: cfg.metal === mt ? '0 0 0 3px #08080a, 0 0 0 4px #e3cf9f' : undefined }}
                />
                <span className={`text-[10px] tracking-wider ${cfg.metal === mt ? 'text-ivory' : 'text-muted'}`}>{METALS[mt].short[lang]}</span>
              </button>
            ))}
          </div>
        </Group>
      </div>
    </aside>
  )
}
