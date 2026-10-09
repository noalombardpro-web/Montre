import { useEffect, useRef, useState } from 'react'
import { partsFor, PART_BY_ID } from '../../data/parts'
import { METALS, WATCH_BY_ID } from '../../data/watches'
import { t } from '../../data/i18n'
import { useAtelier } from '../../store/useAtelier'
import { IconArrow, IconClose } from './Icons'

type Tab = 'overview' | 'how' | 'assembly'

/** Panneau latéral : fiche de la pièce sélectionnée (aperçu, fonctionnement, montage). */
export function PartPanel() {
  const selected = useAtelier((s) => s.selected)
  const lang = useAtelier((s) => s.lang)
  const isolate = useAtelier((s) => s.isolate)
  const watchId = useAtelier((s) => s.watchId)
  const cfg = useAtelier((s) => s.configs[s.watchId])
  const quiz = useAtelier((s) => s.quiz)
  const tour = useAtelier((s) => s.tour)
  const [tab, setTab] = useState<Tab>('overview')
  const heading = useRef<HTMLHeadingElement>(null)
  const meta = selected ? PART_BY_ID[selected] : null

  useEffect(() => {
    if (meta) heading.current?.focus({ preventScroll: true })
  }, [meta])

  if (!meta || quiz || tour) return null
  const list = partsFor(WATCH_BY_ID[watchId], cfg)
  const idx = list.findIndex((p) => p.id === meta.id)
  const go = (d: number) => useAtelier.getState().select(list[(idx + d + list.length) % list.length].id)
  const other = lang === 'fr' ? 'en' : 'fr'
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: L('Aperçu', 'Overview') },
    { id: 'how', label: L('Fonctionnement', 'How it works') },
    { id: 'assembly', label: L('Montage', 'Assembly') },
  ]
  const links = (meta.links ?? []).filter((id) => list.some((p) => p.id === id))

  return (
    <aside
      aria-labelledby="part-title"
      className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-30 max-h-[56svh] overflow-y-auto p-6 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:max-h-[calc(100svh-14rem)] md:w-[400px] md:p-8"
      style={{ animation: 'panelIn .7s var(--ease-lux)' }}
    >
      <style>{`@keyframes panelIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}`}</style>
      <div className="flex items-start justify-between gap-4">
        <div className="eyebrow">
          {meta.group === 'movement' ? L('Mouvement', 'Movement') : L('Habillage', 'Case & dress')} · {String(idx + 1).padStart(2, '0')}/{list.length}
        </div>
        <button type="button" onClick={() => useAtelier.getState().select(null)} className="-m-2 p-2 text-muted transition hover:text-ivory" aria-label={t('close', lang)}>
          <IconClose />
        </button>
      </div>
      <h2 id="part-title" ref={heading} tabIndex={-1} className="display mt-4 text-[2.5rem] text-ivory outline-none">
        {meta.name[lang]}
      </h2>
      <div className="mt-1 font-serif text-lg italic text-muted">{meta.name[other]}</div>

      <div role="tablist" aria-label={L('Rubriques', 'Sections')} className="mt-5 flex border-b border-line">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={`-mb-px border-b px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition ${tab === tb.id ? 'border-champagne text-champagne' : 'border-transparent text-muted hover:text-ivory'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-5 text-[13.5px] leading-relaxed">
        {tab === 'overview' && (
          <dl className="space-y-5">
            <div>
              <dt className="eyebrow mb-1.5 !text-[9.5px] !text-muted">{t('material', lang)}</dt>
              <dd className="text-ivory/90">
                {meta.metal ? `${METALS[cfg.metal].label[lang]} — ` : ''}
                {meta.material[lang]}
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-1.5 !text-[9.5px] !text-muted">{t('role', lang)}</dt>
              <dd className="text-ivory/90">{meta.function[lang]}</dd>
            </div>
            <p className="text-muted">{meta.description[lang]}</p>
            <div className="border-l border-gold/60 pl-4">
              <div className="eyebrow mb-1.5 !text-[9.5px]">{t('funFact', lang)}</div>
              <p className="font-serif text-xl leading-snug text-champagne">{meta.funFact[lang]}</p>
            </div>
          </dl>
        )}
        {tab === 'how' && (
          <div className="space-y-5">
            <p className="text-ivory/90">{meta.howItWorks?.[lang] ?? meta.function[lang]}</p>
            {links.length > 0 && (
              <div>
                <div className="eyebrow mb-2 !text-[9.5px] !text-muted">{L('Interagit avec', 'Works with')}</div>
                <div className="flex flex-wrap gap-2">
                  {links.map((id) => (
                    <button key={id} type="button" className="chip !normal-case !tracking-normal" onClick={() => useAtelier.getState().select(id)}>
                      {PART_BY_ID[id].name[lang]} →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'assembly' && (
          <div className="space-y-5">
            <p className="text-ivory/90">{meta.assembly?.[lang] ?? '—'}</p>
            {meta.tools && meta.tools.length > 0 && (
              <div>
                <div className="eyebrow mb-2 !text-[9.5px] !text-muted">{L('Outils', 'Tools')}</div>
                <ul className="flex flex-wrap gap-2">
                  {meta.tools.map((tool) => (
                    <li key={tool.fr} className="border border-line px-2.5 py-1 text-[11.5px] text-ivory/80">
                      {tool[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              className="text-[10.5px] uppercase tracking-[0.22em] text-champagne hover:underline"
              onClick={() => {
                const s = useAtelier.getState()
                s.startTour('assembly')
              }}
            >
              {L('Lancer le montage pas à pas', 'Start step-by-step assembly')} →
            </button>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center gap-2">
        <button type="button" className="chip flex-1" aria-pressed={isolate} onClick={() => useAtelier.getState().toggle('isolate')}>
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
