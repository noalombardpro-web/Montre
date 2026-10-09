import { create } from 'zustand'
import type { Lang } from '../data/parts'
import { DEFAULT_WATCH, WATCHES, WATCH_BY_ID, type WatchConfig, type WatchId } from '../data/watches'

export type Mode = 'normal' | 'exploded' | 'movement' | 'xray'
export type Page = 'landing' | 'atelier' | 'collection'
export type TourId = 'assembly' | 'energy'
export type Quality = 'high' | 'low'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
/** `?q=low|high` force le niveau de qualité (tests, appareils modestes). */
const forcedQuality = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('q') : null
const initialQuality: 'high' | 'low' =
  forcedQuality === 'low' || forcedQuality === 'high'
    ? forcedQuality
    : coarse || (typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 8) <= 4)
      ? 'low'
      : 'high'

interface AtelierState {
  page: Page
  watchId: WatchId
  configs: Record<WatchId, WatchConfig>
  mode: Mode
  /** Cible d'éclatement 0..1 (le rendu interpole vers cette valeur). */
  explode: number
  wireframe: boolean
  /** Ralenti ×1/8 de l'échappement en mode Mouvement. */
  slowMo: boolean
  selected: string | null
  hovered: string | null
  isolate: boolean
  autoRotate: boolean
  hotspots: boolean
  lang: Lang
  quality: Quality
  reducedMotion: boolean
  sceneReady: boolean
  /** Toutes les pièces de la montre affichée sont montées. */
  staged: boolean
  configOpen: boolean
  helpOpen: boolean
  /** Tiroir de choix du modèle dans l'atelier. */
  drawerOpen: boolean
  /** Tour de poignet (mm) : dimensionne la boucle du bracelet. */
  wrist: number
  /** Mode nuit : lumière éteinte, luminescence révélée. */
  night: boolean
  /** Vue en coupe : position du plan de coupe (mm, sur l'axe X) ou null. */
  cut: number | null
  /** Tic-tac synthétisé (Web Audio). */
  sound: boolean
  /** Visite guidée en cours (montage pas à pas, trajet de l'énergie). */
  tour: { id: TourId; step: number } | null
  /** Quiz « quelle est cette pièce ? ». */
  quiz: boolean
  /** Références sélectionnées pour le comparateur (max 3). */
  compare: WatchId[]
  /** Incrémenté pour demander une action ponctuelle à la scène. */
  screenshotNonce: number
  resetNonce: number

  setPage: (p: Page) => void
  setWatch: (id: WatchId) => void
  setConfig: (patch: Partial<WatchConfig>) => void
  setMode: (m: Mode) => void
  setExplode: (v: number) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  toggle: (k: 'wireframe' | 'slowMo' | 'isolate' | 'autoRotate' | 'hotspots' | 'configOpen' | 'helpOpen' | 'drawerOpen' | 'night' | 'sound' | 'quiz') => void
  startTour: (id: TourId | null) => void
  toggleCompare: (id: WatchId) => void
  set: (patch: Partial<AtelierState>) => void
  setLang: (l: Lang) => void
  screenshot: () => void
  resetView: () => void
}

export const useAtelier = create<AtelierState>((set, get) => ({
  page: 'landing',
  watchId: DEFAULT_WATCH,
  configs: Object.fromEntries(WATCHES.map((w) => [w.id, { ...w.defaults }])) as Record<WatchId, WatchConfig>,
  mode: 'normal',
  explode: 0,
  wireframe: false,
  slowMo: false,
  selected: null,
  hovered: null,
  isolate: false,
  autoRotate: !prefersReducedMotion,
  hotspots: true,
  lang: (typeof navigator !== 'undefined' && !navigator.language.startsWith('fr') ? 'en' : 'fr') as Lang,
  quality: initialQuality,
  reducedMotion: !!prefersReducedMotion,
  sceneReady: false,
  staged: false,
  configOpen: false,
  helpOpen: false,
  drawerOpen: false,
  wrist: 185,
  night: false,
  cut: null,
  sound: false,
  tour: null,
  quiz: false,
  compare: [],
  screenshotNonce: 0,
  resetNonce: 0,

  setPage: (page) => set({ page, selected: null, isolate: false, tour: null, quiz: false, drawerOpen: false }),
  setWatch: (watchId) => {
    if (!WATCH_BY_ID[watchId] || watchId === get().watchId) return
    set({ watchId, selected: null, isolate: false, tour: null })
  },
  setConfig: (patch) => {
    const { watchId, configs } = get()
    set({ configs: { ...configs, [watchId]: { ...configs[watchId], ...patch } } })
  },
  setMode: (mode) => {
    const explode = mode === 'exploded' ? 1 : mode === 'xray' ? get().explode : 0
    set({ mode, explode, isolate: false })
  },
  setExplode: (explode) => {
    const { mode } = get()
    const next: Partial<AtelierState> = { explode }
    if (explode > 0.02 && (mode === 'normal' || mode === 'movement')) next.mode = 'exploded'
    if (explode <= 0.02 && mode === 'exploded') next.mode = 'normal'
    set(next)
  },
  select: (selected) => set({ selected, isolate: selected ? get().isolate : false }),
  hover: (hovered) => set({ hovered }),
  toggle: (k) => set({ [k]: !get()[k] } as Partial<AtelierState>),
  set: (patch) => set(patch),
  setLang: (lang) => {
    document.documentElement.lang = lang
    set({ lang })
  },
  startTour: (id) =>
    set({
      tour: id ? { id, step: 0 } : null,
      selected: null,
      isolate: false,
      quiz: false,
      configOpen: false,
      mode: id === 'energy' ? 'movement' : 'normal',
      explode: 0,
      cut: null,
    }),
  toggleCompare: (id) => {
    const c = get().compare
    set({ compare: c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-3) })
  },
  screenshot: () => set({ screenshotNonce: get().screenshotNonce + 1 }),
  resetView: () => set({ resetNonce: get().resetNonce + 1, selected: null, isolate: false }),
}))

/**
 * Valeurs animées lues chaque frame par la scène (hors React pour éviter les re-rendus).
 */
export const anim = {
  explode: 0,
  /** 0..1 : mélange du mode mouvement (fond de boîte masqué, bracelet estompé). */
  movement: 0,
  /** Progression du scroll sur la landing 0..1. */
  scroll: 0,
  /** Décalage de transition entre modèles. */
  swap: 0,
  /** Progression 0..1 de l'animation de l'étape de visite en cours. */
  tourT: 1,
}
