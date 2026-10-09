import { useEffect, useMemo, useRef, useState } from 'react'
import { partsFor } from '../../data/parts'
import { BRANDS, CATEGORIES, WATCHES, WATCH_BY_ID, type BrandId } from '../../data/watches'
import { t, type Key } from '../../data/i18n'
import { useAtelier, type Mode } from '../../store/useAtelier'
import { navigate, shareUrl } from '../../lib/router'
import {
  IconArrow,
  IconBolt,
  IconCamera,
  IconClose,
  IconCut,
  IconGrid,
  IconKeyboard,
  IconList,
  IconMoon,
  IconPin,
  IconQuiz,
  IconRotate,
  IconShare,
  IconSliders,
  IconSlow,
  IconSound,
  IconTarget,
  IconWire,
  IconWrench,
} from './Icons'
import { WatchImage } from './WatchThumb'

export const MODES: { id: Mode; key: string; label: Key }[] = [
  { id: 'normal', key: '1', label: 'normal' },
  { id: 'exploded', key: '2', label: 'exploded' },
  { id: 'movement', key: '3', label: 'movement' },
  { id: 'xray', key: '4', label: 'xray' },
]

const step = (d: number) => {
  const s = useAtelier.getState()
  const i = WATCHES.findIndex((w) => w.id === s.watchId)
  s.setWatch(WATCHES[(i + d + WATCHES.length) % WATCHES.length].id)
}

export function TopBar() {
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const w = WATCH_BY_ID[watchId]
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-[var(--gutter)] pt-5 md:pt-7">
      <a
        href="#/"
        onClick={(e) => {
          e.preventDefault()
          navigate('landing')
        }}
        className="pointer-events-auto flex items-center gap-3"
        aria-label={`Watch Atelier — ${t('back', lang)}`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/60">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        </span>
        <span className="hidden font-serif text-xl tracking-[0.18em] text-ivory lg:inline">WATCH ATELIER</span>
      </a>
      <div className="glass pointer-events-auto flex min-w-0 items-center">
        <button type="button" onClick={() => step(-1)} className="p-2.5 text-muted hover:text-ivory" aria-label={lang === 'fr' ? 'Modèle précédent' : 'Previous model'}>
          <IconArrow dir="left" width={14} height={14} />
        </button>
        <button
          type="button"
          onClick={() => useAtelier.getState().toggle('drawerOpen')}
          className="flex min-w-0 items-center gap-3 border-x border-line px-3 py-2 text-left hover:bg-white/[0.03] md:px-4"
          aria-haspopup="dialog"
        >
          <IconGrid width={14} height={14} className="shrink-0 text-gold" />
          <span className="min-w-0">
            <span className="block truncate text-[9px] uppercase tracking-[0.26em] text-gold">{BRANDS[w.brand].name}</span>
            <span className="block max-w-[46vw] truncate font-serif text-[15px] text-ivory md:max-w-[28vw]">{w.name}</span>
          </span>
        </button>
        <button type="button" onClick={() => step(1)} className="p-2.5 text-muted hover:text-ivory" aria-label={lang === 'fr' ? 'Modèle suivant' : 'Next model'}>
          <IconArrow width={14} height={14} />
        </button>
      </div>
      <div className="pointer-events-auto flex items-center gap-1">
        <a
          href="#/collection"
          className="hidden px-2 py-2 text-[10.5px] uppercase tracking-[0.24em] text-muted hover:text-ivory md:block"
          onClick={(e) => {
            e.preventDefault()
            navigate('collection')
          }}
        >
          {t('catalogue', lang)}
        </a>
        <button
          type="button"
          className="px-2 py-2 text-[10.5px] tracking-[0.24em] text-muted hover:text-ivory"
          onClick={() => useAtelier.getState().setLang(lang === 'fr' ? 'en' : 'fr')}
          aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
        <button type="button" className="hidden p-2 text-muted hover:text-ivory md:block" onClick={() => useAtelier.getState().toggle('helpOpen')} aria-label={t('shortcuts', lang)}>
          <IconKeyboard />
        </button>
      </div>
    </header>
  )
}

/** Tiroir de sélection du modèle : recherche + liste par maison. */
export function ModelDrawer() {
  const open = useAtelier((s) => s.drawerOpen)
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50)
  }, [open])
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const map = new Map<BrandId, typeof WATCHES>()
    for (const w of WATCHES) {
      if (needle && !`${BRANDS[w.brand].name} ${w.name} ${w.reference}`.toLowerCase().includes(needle)) continue
      map.set(w.brand, [...(map.get(w.brand) ?? []), w])
    }
    return [...map.entries()]
  }, [q])
  if (!open) return null
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  return (
    <div role="dialog" aria-modal="true" aria-label={L('Choisir un modèle', 'Choose a model')} className="pointer-events-auto fixed inset-0 z-[55] bg-ink/60 backdrop-blur-sm" onClick={() => useAtelier.getState().set({ drawerOpen: false })}>
      <aside className="glass absolute inset-y-0 left-0 flex w-full max-w-[420px] flex-col" style={{ animation: 'drawerIn .6s var(--ease-lux)' }} onClick={(e) => e.stopPropagation()}>
        <style>{`@keyframes drawerIn{from{transform:translateX(-30px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <div className="eyebrow">{L('Collection', 'Collection')}</div>
            <div className="display mt-1 text-3xl">
              {WATCHES.length} {L('montres', 'watches')}
            </div>
          </div>
          <button type="button" onClick={() => useAtelier.getState().set({ drawerOpen: false })} aria-label={t('close', lang)} className="-m-2 p-2 text-muted hover:text-ivory">
            <IconClose />
          </button>
        </div>
        <div className="border-b border-line px-5 py-3">
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L('Rechercher une marque, un modèle…', 'Search a brand, a model…')}
            className="w-full bg-transparent py-1.5 text-sm text-ivory outline-none placeholder:text-muted/70"
            aria-label={L('Rechercher', 'Search')}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {groups.map(([brand, list]) => (
            <section key={brand} className="mb-3">
              <h3 className="px-2 py-2 text-[9.5px] uppercase tracking-[0.3em] text-gold">
                {BRANDS[brand].name} <span className="text-muted/70">· {BRANDS[brand].founded}</span>
              </h3>
              <ul>
                {list.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => {
                        useAtelier.getState().set({ drawerOpen: false })
                        useAtelier.getState().setWatch(w.id)
                      }}
                      aria-current={w.id === watchId}
                      className={`flex w-full items-center gap-3 px-2 py-2 text-left transition hover:bg-white/[0.04] ${w.id === watchId ? 'bg-white/[0.05]' : ''}`}
                    >
                      <WatchImage def={w} size={34} className="h-[34px] w-[34px] shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate font-serif text-[17px] ${w.id === watchId ? 'text-champagne' : 'text-ivory'}`}>{w.name}</span>
                        <span className="block truncate text-[10.5px] text-muted">
                          {w.reference} · {CATEGORIES[w.category][lang]} · {w.style.diameter} mm
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!groups.length && <p className="p-4 text-sm text-muted">{L('Aucun résultat.', 'No results.')}</p>}
        </div>
        <a
          href="#/collection"
          onClick={(e) => {
            e.preventDefault()
            useAtelier.getState().set({ drawerOpen: false })
            navigate('collection')
          }}
          className="border-t border-line p-5 text-[10.5px] uppercase tracking-[0.26em] text-champagne hover:bg-white/[0.03]"
        >
          {L('Voir la collection et comparer', 'Browse the collection & compare')} →
        </a>
      </aside>
    </div>
  )
}

export function ModeBar() {
  const mode = useAtelier((s) => s.mode)
  const lang = useAtelier((s) => s.lang)
  const tour = useAtelier((s) => s.tour)
  return (
    <div role="radiogroup" aria-label={t('modes', lang)} className="glass pointer-events-auto flex gap-0.5 p-1 md:flex-col">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={mode === m.id && !tour}
          onClick={() => {
            const s = useAtelier.getState()
            if (s.tour) s.startTour(null)
            s.setMode(m.id)
          }}
          className={`group flex flex-1 items-center justify-center gap-5 whitespace-nowrap px-2 py-2.5 text-[9.5px] uppercase tracking-[0.14em] transition md:min-w-[190px] md:flex-none md:justify-between md:px-4 md:text-left md:text-[10.5px] md:tracking-[0.22em] ${
            mode === m.id && !tour ? 'bg-champagne text-ink' : 'text-muted hover:text-ivory'
          }`}
        >
          <span>{t(m.label, lang)}</span>
          <kbd className={`hidden font-sans text-[9px] md:inline ${mode === m.id && !tour ? 'text-ink/60' : 'text-muted/60'}`}>{m.key}</kbd>
        </button>
      ))}
    </div>
  )
}

/** Expériences : visites guidées, quiz, nuit, coupe, son. */
export function ExperiencesPanel() {
  const lang = useAtelier((s) => s.lang)
  const tour = useAtelier((s) => s.tour)
  const quiz = useAtelier((s) => s.quiz)
  const night = useAtelier((s) => s.night)
  const cut = useAtelier((s) => s.cut)
  const sound = useAtelier((s) => s.sound)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const s = useAtelier.getState
  const items: { key: string; label: string; icon: React.ReactNode; on: boolean; k: string; act: () => void }[] = [
    { key: 'assembly', label: L('Montage pas à pas', 'Step-by-step assembly'), icon: <IconWrench width={15} height={15} />, on: tour?.id === 'assembly', k: 'G', act: () => s().startTour(tour?.id === 'assembly' ? null : 'assembly') },
    { key: 'energy', label: L("Trajet de l'énergie", 'Energy path'), icon: <IconBolt width={15} height={15} />, on: tour?.id === 'energy', k: 'J', act: () => s().startTour(tour?.id === 'energy' ? null : 'energy') },
    { key: 'quiz', label: L('Quiz des pièces', 'Parts quiz'), icon: <IconQuiz width={15} height={15} />, on: quiz, k: 'Q', act: () => s().set({ quiz: !quiz, tour: null, selected: null, isolate: false }) },
    { key: 'night', label: L('Nuit (luminescence)', 'Night (lume)'), icon: <IconMoon width={15} height={15} />, on: night, k: 'N', act: () => s().toggle('night') },
    { key: 'cut', label: L('Vue en coupe', 'Cutaway view'), icon: <IconCut width={15} height={15} />, on: cut !== null, k: 'X', act: () => s().set({ cut: cut === null ? 0 : null }) },
    { key: 'sound', label: L('Tic-tac', 'Tick-tock'), icon: <IconSound width={15} height={15} />, on: sound, k: 'T', act: () => s().toggle('sound') },
  ]
  return (
    <div className="glass pointer-events-auto p-1 md:min-w-[190px]">
      <div className="px-3 pb-1 pt-2 text-[9px] uppercase tracking-[0.3em] text-gold">{L('Découvrir', 'Discover')}</div>
      <ul className="grid grid-cols-2 gap-0.5 md:grid-cols-1">
        {items.map((it) => (
          <li key={it.key}>
            <button
              type="button"
              onClick={it.act}
              aria-pressed={it.on}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[10.5px] tracking-[0.06em] transition md:text-[11.5px] ${it.on ? 'bg-white/[0.07] text-champagne' : 'text-ivory/75 hover:text-ivory'}`}
            >
              <span className={it.on ? 'text-champagne' : 'text-gold/80'}>{it.icon}</span>
              <span className="flex-1 truncate">{it.label}</span>
              <kbd className="hidden text-[9px] text-muted/60 md:inline">{it.k}</kbd>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ToggleBtn({ on, onClick, label, children, k }: { on?: boolean; onClick: () => void; label: string; children: React.ReactNode; k?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={k ? `${label} (${k})` : label}
      className={`grid h-10 w-10 place-items-center transition ${on ? 'text-champagne' : 'text-muted hover:text-ivory'}`}
    >
      {children}
    </button>
  )
}

export function BottomBar() {
  const lang = useAtelier((s) => s.lang)
  const explode = useAtelier((s) => s.explode)
  const mode = useAtelier((s) => s.mode)
  const autoRotate = useAtelier((s) => s.autoRotate)
  const hotspots = useAtelier((s) => s.hotspots)
  const wireframe = useAtelier((s) => s.wireframe)
  const slowMo = useAtelier((s) => s.slowMo)
  const configOpen = useAtelier((s) => s.configOpen)
  const cut = useAtelier((s) => s.cut)
  const [copied, setCopied] = useState(false)
  const s = useAtelier.getState
  const pct = Math.round(explode * 100)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const share = async () => {
    const url = shareUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(L('Lien de cette configuration :', 'Link to this configuration:'), url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="glass pointer-events-auto flex w-full flex-col gap-1 px-4 py-2 md:w-auto md:px-5">
      {cut !== null && (
        <label className="flex items-center gap-4 border-b border-line pb-2">
          <span className="eyebrow !text-[9.5px] !text-muted">{L('Coupe', 'Cut')}</span>
          <input
            type="range"
            className="lux-range flex-1"
            min={-24}
            max={24}
            step={0.5}
            value={cut}
            onChange={(e) => s().set({ cut: Number(e.target.value) })}
            aria-valuetext={`${cut} mm`}
          />
          <span className="w-14 text-right font-serif text-lg tabular-nums text-ivory">{cut} mm</span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:flex-nowrap">
        <label className="flex min-w-[200px] flex-1 items-center gap-4 md:w-[260px] md:flex-none">
          <span className="eyebrow !text-[9.5px] !text-muted">{t('explode', lang)}</span>
          <input
            type="range"
            className="lux-range flex-1"
            min={0}
            max={100}
            step={1}
            value={pct}
            style={{ ['--p' as string]: `${pct}%` }}
            onChange={(e) => s().setExplode(Number(e.target.value) / 100)}
            aria-valuetext={`${pct} %`}
          />
          <span className="w-9 text-right font-serif text-lg tabular-nums text-ivory">{pct}%</span>
        </label>
        <span className="hidden h-6 w-px bg-line md:block" />
        <div className="flex items-center">
          <ToggleBtn on={autoRotate} onClick={() => s().toggle('autoRotate')} label={t('autoRotate', lang)} k="R">
            <IconRotate />
          </ToggleBtn>
          <ToggleBtn on={hotspots} onClick={() => s().toggle('hotspots')} label={t('hotspots', lang)} k="H">
            <IconPin />
          </ToggleBtn>
          <ToggleBtn on={wireframe} onClick={() => s().toggle('wireframe')} label={t('wireframe', lang)} k="W">
            <IconWire />
          </ToggleBtn>
          {mode === 'movement' && (
            <ToggleBtn on={slowMo} onClick={() => s().toggle('slowMo')} label={L('Ralenti ×1/8', 'Slow motion ×1/8')} k="M">
              <IconSlow />
            </ToggleBtn>
          )}
          <ToggleBtn onClick={() => s().resetView()} label={t('resetView', lang)} k="V">
            <IconTarget />
          </ToggleBtn>
          <ToggleBtn onClick={() => s().screenshot()} label={t('screenshot', lang)} k="S">
            <IconCamera />
          </ToggleBtn>
          <ToggleBtn on={copied} onClick={share} label={copied ? L('Lien copié !', 'Link copied!') : L('Partager la configuration', 'Share configuration')}>
            <IconShare />
          </ToggleBtn>
          <ToggleBtn on={configOpen} onClick={() => s().set({ configOpen: !configOpen, selected: null })} label={t('configure', lang)} k="C">
            <IconSliders />
          </ToggleBtn>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? L('Lien copié dans le presse-papiers', 'Link copied to clipboard') : ''}
      </span>
    </div>
  )
}

export function PartsIndex({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const cfg = useAtelier((s) => s.configs[s.watchId])
  const selected = useAtelier((s) => s.selected)
  if (!open) return null
  const list = partsFor(WATCH_BY_ID[watchId], cfg)
  const groups = [
    { id: 'exterior', label: lang === 'fr' ? 'Habillage' : 'Case & dress' },
    { id: 'movement', label: lang === 'fr' ? 'Mouvement' : 'Movement' },
  ] as const
  return (
    <nav aria-label={t('parts', lang)} className="glass pointer-events-auto max-h-[40svh] w-full overflow-y-auto p-5 md:w-[250px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">{t('parts', lang)}</span>
        <button type="button" onClick={onClose} aria-label={t('close', lang)} className="-m-1 p-1 text-muted hover:text-ivory">
          <IconClose width={14} height={14} />
        </button>
      </div>
      {groups.map((g) => (
        <div key={g.id} className="mb-3">
          <div className="mb-1 text-[9.5px] uppercase tracking-[0.3em] text-muted/70">{g.label}</div>
          <ul>
            {list
              .filter((p) => p.group === g.id)
              .map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const st = useAtelier.getState()
                      if (st.tour) st.startTour(null)
                      if (p.group === 'movement' && st.mode === 'normal') st.setMode('exploded')
                      st.select(p.id)
                    }}
                    aria-current={selected === p.id}
                    className={`w-full py-1 text-left font-serif text-[17px] transition ${selected === p.id ? 'text-champagne' : 'text-ivory/80 hover:text-ivory'}`}
                  >
                    {p.name[lang]}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function PartsIndexButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const lang = useAtelier((s) => s.lang)
  return (
    <button type="button" onClick={onClick} aria-expanded={open} className="glass pointer-events-auto flex items-center gap-3 px-4 py-2.5 text-[10.5px] uppercase tracking-[0.22em] text-muted hover:text-ivory">
      <IconList width={15} height={15} /> {t('parts', lang)} <kbd className="hidden text-[9px] opacity-60 md:inline">P</kbd>
    </button>
  )
}

const SHORTCUTS: [string, { fr: string; en: string }][] = [
  ['1 – 4', { fr: 'Normal · Éclaté · Mouvement · Rayons X', en: 'Normal · Exploded · Movement · X-ray' }],
  ['E', { fr: 'Basculer la vue éclatée', en: 'Toggle exploded view' }],
  ['G', { fr: 'Montage pas à pas', en: 'Step-by-step assembly' }],
  ['J', { fr: "Trajet de l'énergie", en: 'Energy path tour' }],
  ['Q', { fr: 'Quiz des pièces', en: 'Parts quiz' }],
  ['N', { fr: 'Mode nuit (luminescence)', en: 'Night mode (lume)' }],
  ['X', { fr: 'Vue en coupe', en: 'Cutaway view' }],
  ['T', { fr: 'Tic-tac sonore', en: 'Tick-tock sound' }],
  ['← →', { fr: 'Pièce / étape précédente · suivante', en: 'Previous / next part or step' }],
  ['I', { fr: 'Isoler la pièce', en: 'Isolate part' }],
  ['Échap', { fr: 'Désélectionner / fermer', en: 'Deselect / close' }],
  ['R · H · W', { fr: 'Rotation · Repères · Fil de fer', en: 'Rotate · Hotspots · Wireframe' }],
  ['M', { fr: 'Ralenti (mode Mouvement)', en: 'Slow motion (Movement)' }],
  ['C · P · V · S', { fr: 'Configurateur · Pièces · Recentrer · Capture', en: 'Configure · Parts · Reset · Capture' }],
  ['[ ] · K', { fr: 'Modèle précédent / suivant · Collection', en: 'Previous / next model · Collection' }],
  ['?', { fr: 'Cette aide', en: 'This help' }],
]

export function HelpOverlay() {
  const open = useAtelier((s) => s.helpOpen)
  const lang = useAtelier((s) => s.lang)
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('shortcuts', lang)}
      className="pointer-events-auto fixed inset-0 z-[60] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={() => useAtelier.getState().set({ helpOpen: false })}
    >
      <div className="glass max-h-[90svh] w-full max-w-md overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow">{t('shortcuts', lang)}</div>
        <ul className="mt-5 space-y-2.5 text-sm">
          {SHORTCUTS.map(([k, d]) => (
            <li key={k} className="flex items-center justify-between gap-6">
              <span className="text-ivory/80">{d[lang]}</span>
              <kbd className="shrink-0 border border-line px-2 py-0.5 font-sans text-[11px] text-champagne">{k}</kbd>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-lux mt-7 w-full justify-center" autoFocus onClick={() => useAtelier.getState().set({ helpOpen: false })}>
          {t('close', lang)}
        </button>
      </div>
    </div>
  )
}

/** Raccourcis clavier de l'atelier. */
export function useShortcuts(togglePartsIndex: () => void, tourStep: (d: number) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (target.closest('input, textarea, select')) {
        if (e.key !== 'Escape') return
      }
      const s = useAtelier.getState()
      const def = WATCH_BY_ID[s.watchId]
      const list = partsFor(def, s.configs[s.watchId])
      const idx = s.selected ? list.findIndex((p) => p.id === s.selected) : -1
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          if (s.tour) s.startTour(null)
          s.setMode(MODES[Number(e.key) - 1].id)
          break
        case 'e':
        case 'E':
          s.setMode(s.explode > 0.5 ? 'normal' : 'exploded')
          break
        case 'ArrowRight':
          if (s.tour) tourStep(1)
          else if (!s.quiz) s.select(list[(idx + 1) % list.length].id)
          break
        case 'ArrowLeft':
          if (s.tour) tourStep(-1)
          else if (!s.quiz) s.select(list[(idx - 1 + list.length) % list.length].id)
          break
        case 'i':
        case 'I':
          if (s.selected) s.toggle('isolate')
          break
        case 'Escape':
          if (s.helpOpen) s.set({ helpOpen: false })
          else if (s.drawerOpen) s.set({ drawerOpen: false })
          else if (s.tour) s.startTour(null)
          else if (s.quiz) s.set({ quiz: false, selected: null, isolate: false })
          else if (s.isolate) s.set({ isolate: false })
          else if (s.selected) s.select(null)
          else if (s.configOpen) s.set({ configOpen: false })
          else if (s.cut !== null) s.set({ cut: null })
          break
        case 'r':
        case 'R':
          s.toggle('autoRotate')
          break
        case 'h':
        case 'H':
          s.toggle('hotspots')
          break
        case 'w':
        case 'W':
          s.toggle('wireframe')
          break
        case 'm':
        case 'M':
          s.toggle('slowMo')
          break
        case 'c':
        case 'C':
          s.set({ configOpen: !s.configOpen, selected: null })
          break
        case 'p':
        case 'P':
          togglePartsIndex()
          break
        case 'v':
        case 'V':
          s.resetView()
          break
        case 's':
        case 'S':
          s.screenshot()
          break
        case 'g':
        case 'G':
          s.startTour(s.tour?.id === 'assembly' ? null : 'assembly')
          break
        case 'j':
        case 'J':
          s.startTour(s.tour?.id === 'energy' ? null : 'energy')
          break
        case 'q':
        case 'Q':
          s.set({ quiz: !s.quiz, tour: null, selected: null, isolate: false })
          break
        case 'n':
        case 'N':
          s.toggle('night')
          break
        case 'x':
        case 'X':
          s.set({ cut: s.cut === null ? 0 : null })
          break
        case 't':
        case 'T':
          s.toggle('sound')
          break
        case 'k':
        case 'K':
          s.toggle('drawerOpen')
          break
        case '[':
          step(-1)
          break
        case ']':
          step(1)
          break
        case '?':
          s.toggle('helpOpen')
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePartsIndex, tourStep])
}
