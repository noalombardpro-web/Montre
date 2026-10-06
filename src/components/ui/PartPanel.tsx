import { useEffect, useRef } from 'react'
import { partsFor, PART_BY_ID } from '../../data/parts'
import { METALS } from '../../data/watches'
import { t } from '../../data/i18n'
import { useAtelier } from '../../store/useAtelier'
import { IconArrow, IconClose } from './Icons'

/** Panneau latéral : fiche de la pièce sélectionnée. */
export function PartPanel() {
  const selected = useAtelier((s) => s.selected)
  const lang = useAtelier((s) => s.lang)
  const isolate = useAtelier((s) => s.isolate)
  const watchId = useAtelier((s) => s.watchId)
  const metal = useAtelier((s) => s.configs[s.watchId].metal)
  const heading = useRef<HTMLHeadingElement>(null)
  const meta = selected ? PART_BY_ID[selected] : null

  useEffect(() => {
    if (meta) heading.current?.focus({ preventScroll: true })
  }, [meta])

  if (!meta) return null
  const list = partsFor(watchId)
  const idx = list.findIndex((p) => p.id === meta.id)
  const go = (d: number) => useAtelier.getState().select(list[(idx + d + list.length) % list.length].id)
  const other = lang === 'fr' ? 'en' : 'fr'

  return (
    <aside
      aria-labelledby="part-title"
      className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-30 max-h-[52svh] overflow-y-auto p-6 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:max-h-[calc(100svh-8rem)] md:w-[380px] md:p-8"
      style={{ animation: 'panelIn .7s var(--ease-lux)' }}
    >
      <style>{`@keyframes panelIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}`}</style>
      <div className="flex items-start justify-between gap-4">
        <div className="eyebrow">
          {meta.group === 'movement' ? (lang === 'fr' ? 'Mouvement' : 'Movement') : lang === 'fr' ? 'Habillage' : 'Case & dress'} ·{' '}
          {String(idx + 1).padStart(2, '0')}/{list.length}
        </div>
        <button
          type="button"
          onClick={() => useAtelier.getState().select(null)}
          className="-m-2 p-2 text-muted transition hover:text-ivory"
          aria-label={t('close', lang)}
        >
          <IconClose />
        </button>
      </div>
      <h2 id="part-title" ref={heading} tabIndex={-1} className="display mt-4 text-[2.6rem] text-ivory outline-none">
        {meta.name[lang]}
      </h2>
      <div className="mt-1 font-serif text-lg italic text-muted">{meta.name[other]}</div>
      <div className="hairline my-6" />
      <dl className="space-y-5 text-[13.5px] leading-relaxed">
        <div>
          <dt className="eyebrow mb-1.5 !text-[9.5px] !text-muted">{t('material', lang)}</dt>
          <dd className="text-ivory/90">
            {meta.metal ? `${METALS[metal].label[lang]} — ` : ''}
            {meta.material[lang]}
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-1.5 !text-[9.5px] !text-muted">{t('role', lang)}</dt>
          <dd className="text-ivory/90">{meta.function[lang]}</dd>
        </div>
        <p className="text-muted">{meta.description[lang]}</p>
      </dl>
      <div className="mt-6 border-l border-gold/60 pl-4">
        <div className="eyebrow mb-1.5 !text-[9.5px]">{t('funFact', lang)}</div>
        <p className="font-serif text-xl leading-snug text-champagne">{meta.funFact[lang]}</p>
      </div>
      <div className="mt-7 flex items-center gap-2">
        <button
          type="button"
          className="chip flex-1"
          aria-pressed={isolate}
          onClick={() => useAtelier.getState().toggle('isolate')}
        >
          {isolate ? t('showAll', lang) : t('isolate', lang)} <span className="opacity-50">· I</span>
        </button>
        <button type="button" className="chip" onClick={() => go(-1)} aria-label={t('prev', lang)}>
          <IconArrow dir="left" width={14} height={14} />
        </button>
        <button type="button" className="chip" onClick={() => go(1)} aria-label={t('next', lang)}>
          <IconArrow width={14} height={14} />
        </button>
      </div>
    </aside>
  )
}
