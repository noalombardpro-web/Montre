import { useEffect } from 'react'
import { partsFor } from '../../data/parts'
import { WATCHES } from '../../data/watches'
import { t, type Key } from '../../data/i18n'
import { useAtelier, type Mode } from '../../store/useAtelier'
import { navigate } from '../../lib/router'
import { IconCamera, IconClose, IconKeyboard, IconList, IconPin, IconRotate, IconSliders, IconSlow, IconTarget, IconWire } from './Icons'

export const MODES: { id: Mode; key: string; label: Key }[] = [
  { id: 'normal', key: '1', label: 'normal' },
  { id: 'exploded', key: '2', label: 'exploded' },
  { id: 'movement', key: '3', label: 'movement' },
  { id: 'xray', key: '4', label: 'xray' },
]

export function TopBar() {
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-[var(--gutter)] pt-5 md:pt-7">
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
        <span className="hidden font-serif text-xl tracking-[0.18em] text-ivory sm:inline">WATCH ATELIER</span>
      </a>
      <nav aria-label={t('catalogue', lang)} className="pointer-events-auto flex gap-1 overflow-x-auto scrollbar-none">
        {WATCHES.map((w) => (
          <button
            key={w.id}
            type="button"
            aria-current={w.id === watchId ? 'page' : undefined}
            onClick={() => useAtelier.getState().setWatch(w.id)}
            className={`relative whitespace-nowrap px-2 py-2 text-[9.5px] uppercase tracking-[0.14em] transition md:px-4 md:text-[10.5px] md:tracking-[0.24em] ${w.id === watchId ? 'text-champagne' : 'text-muted hover:text-ivory'}`}
          >
            {w.name.replace('-style', '')}
            <span
              className={`absolute inset-x-2 -bottom-0.5 h-px bg-gold transition-transform duration-700 md:inset-x-4 ${w.id === watchId ? 'scale-x-100' : 'scale-x-0'}`}
            />
          </button>
        ))}
      </nav>
      <div className="pointer-events-auto flex items-center gap-1">
        <button
          type="button"
          className="px-2 py-2 text-[10.5px] tracking-[0.24em] text-muted hover:text-ivory"
          onClick={() => useAtelier.getState().setLang(lang === 'fr' ? 'en' : 'fr')}
          aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
        <button
          type="button"
          className="hidden p-2 text-muted hover:text-ivory md:block"
          onClick={() => useAtelier.getState().toggle('helpOpen')}
          aria-label={t('shortcuts', lang)}
        >
          <IconKeyboard />
        </button>
      </div>
    </header>
  )
}

export function ModeBar() {
  const mode = useAtelier((s) => s.mode)
  const lang = useAtelier((s) => s.lang)
  return (
    <div
      role="radiogroup"
      aria-label={t('modes', lang)}
      className="glass pointer-events-auto flex gap-0.5 p-1 md:flex-col"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={mode === m.id}
          onClick={() => useAtelier.getState().setMode(m.id)}
          className={`group flex flex-1 items-center justify-center gap-5 whitespace-nowrap px-2 py-2.5 text-[9.5px] uppercase tracking-[0.14em] transition md:min-w-[170px] md:flex-none md:justify-between md:px-4 md:text-left md:text-[10.5px] md:tracking-[0.22em] ${
            mode === m.id ? 'bg-champagne text-ink' : 'text-muted hover:text-ivory'
          }`}
        >
          <span>{t(m.label, lang)}</span>
          <kbd className={`hidden font-sans text-[9px] md:inline ${mode === m.id ? 'text-ink/60' : 'text-muted/60'}`}>{m.key}</kbd>
        </button>
      ))}
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
  const s = useAtelier.getState
  const pct = Math.round(explode * 100)
  return (
    <div className="glass pointer-events-auto flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 md:w-auto md:flex-nowrap md:px-5">
      <label className="flex min-w-[220px] flex-1 items-center gap-4 md:w-[300px] md:flex-none">
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
          <ToggleBtn on={slowMo} onClick={() => s().toggle('slowMo')} label={lang === 'fr' ? 'Ralenti ×1/8' : 'Slow motion ×1/8'} k="M">
            <IconSlow />
          </ToggleBtn>
        )}
        <ToggleBtn onClick={() => s().resetView()} label={t('resetView', lang)} k="V">
          <IconTarget />
        </ToggleBtn>
        <ToggleBtn onClick={() => s().screenshot()} label={t('screenshot', lang)} k="S">
          <IconCamera />
        </ToggleBtn>
        <ToggleBtn on={configOpen} onClick={() => s().set({ configOpen: !configOpen, selected: null })} label={t('configure', lang)} k="C">
          <IconSliders />
        </ToggleBtn>
      </div>
    </div>
  )
}

export function PartsIndex({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const selected = useAtelier((s) => s.selected)
  if (!open) return null
  const list = partsFor(watchId)
  const groups = [
    { id: 'exterior', label: lang === 'fr' ? 'Habillage' : 'Case & dress' },
    { id: 'movement', label: lang === 'fr' ? 'Mouvement' : 'Movement' },
  ] as const
  return (
    <nav aria-label={t('parts', lang)} className="glass pointer-events-auto max-h-[46svh] w-full overflow-y-auto p-5 md:w-[250px]">
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
  ['← →', { fr: 'Pièce précédente / suivante', en: 'Previous / next part' }],
  ['I', { fr: 'Isoler la pièce', en: 'Isolate part' }],
  ['Échap', { fr: 'Désélectionner / fermer', en: 'Deselect / close' }],
  ['R', { fr: 'Rotation automatique', en: 'Auto-rotate' }],
  ['H', { fr: 'Afficher les repères', en: 'Toggle hotspots' }],
  ['W', { fr: 'Fil de fer', en: 'Wireframe' }],
  ['M', { fr: 'Ralenti (mode Mouvement)', en: 'Slow motion (Movement)' }],
  ['C', { fr: 'Configurateur', en: 'Configurator' }],
  ['P', { fr: 'Liste des pièces', en: 'Parts list' }],
  ['V', { fr: 'Recentrer la vue', en: 'Reset view' }],
  ['S', { fr: 'Capture PNG', en: 'PNG capture' }],
  ['[ ]', { fr: 'Modèle précédent / suivant', en: 'Previous / next model' }],
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
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={() => useAtelier.getState().set({ helpOpen: false })}
    >
      <div className="glass w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow">{t('shortcuts', lang)}</div>
        <ul className="mt-5 space-y-2.5 text-sm">
          {SHORTCUTS.map(([k, d]) => (
            <li key={k} className="flex items-center justify-between gap-6">
              <span className="text-ivory/80">{d[lang]}</span>
              <kbd className="border border-line px-2 py-0.5 font-sans text-[11px] text-champagne">{k}</kbd>
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
export function useShortcuts(togglePartsIndex: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (target.closest('input, textarea, select')) {
        if (e.key !== 'Escape') return
      }
      const s = useAtelier.getState()
      const list = partsFor(s.watchId)
      const idx = s.selected ? list.findIndex((p) => p.id === s.selected) : -1
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          s.setMode(MODES[Number(e.key) - 1].id)
          break
        case 'e':
        case 'E':
          s.setMode(s.explode > 0.5 ? 'normal' : 'exploded')
          break
        case 'ArrowRight':
          s.select(list[(idx + 1) % list.length].id)
          break
        case 'ArrowLeft':
          s.select(list[(idx - 1 + list.length) % list.length].id)
          break
        case 'i':
        case 'I':
          if (s.selected) s.toggle('isolate')
          break
        case 'Escape':
          if (s.helpOpen) s.set({ helpOpen: false })
          else if (s.isolate) s.set({ isolate: false })
          else if (s.selected) s.select(null)
          else if (s.configOpen) s.set({ configOpen: false })
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
        case '[':
        case ']': {
          const i = WATCHES.findIndex((w) => w.id === s.watchId)
          const n = WATCHES[(i + (e.key === ']' ? 1 : -1) + WATCHES.length) % WATCHES.length]
          s.setWatch(n.id)
          break
        }
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
  }, [togglePartsIndex])
}
