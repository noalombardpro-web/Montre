import { useEffect } from 'react'
import { BRACELETS, DIAL_COLORS, METALS, WATCH_BY_ID, type WatchConfig, type WatchId } from '../data/watches'
import { useAtelier, type Page } from '../store/useAtelier'

/**
 * Routage par hash (compatible hébergement statique) :
 *   #/                                  landing
 *   #/collection                        collection complète
 *   #/atelier/<modèle>                  atelier
 *   #/atelier/<modèle>/<cadran>.<lunette>.<bracelet>.<métal>   configuration partagée
 */
export function parseHash(hash = location.hash): { page: Page; watch?: WatchId; config?: Partial<WatchConfig> } {
  if (/^#\/collection/.test(hash)) return { page: 'collection' }
  const m = hash.match(/^#\/atelier(?:\/([\w-]+))?(?:\/([\w.-]+))?/)
  if (m) {
    const watch = m[1] && WATCH_BY_ID[m[1]] ? m[1] : undefined
    let config: Partial<WatchConfig> | undefined
    if (watch && m[2]) {
      const [dial, bezel, bracelet, metal] = m[2].split('.')
      const w = WATCH_BY_ID[watch]
      config = {}
      if (dial in DIAL_COLORS) config.dial = dial as WatchConfig['dial']
      if (w.bezels.some((b) => b.id === bezel)) config.bezel = bezel
      if (bracelet in BRACELETS) config.bracelet = bracelet as WatchConfig['bracelet']
      if (metal in METALS) config.metal = metal as WatchConfig['metal']
    }
    return { page: 'atelier', watch, config }
  }
  return { page: 'landing' }
}

export function navigate(page: Page, watch?: WatchId) {
  const id = watch ?? useAtelier.getState().watchId
  location.hash = page === 'atelier' ? `#/atelier/${id}` : page === 'collection' ? '#/collection' : '#/'
}

/** Lien partageable vers la configuration courante. */
export function shareUrl() {
  const s = useAtelier.getState()
  const c = s.configs[s.watchId]
  return `${location.origin}${location.pathname}#/atelier/${s.watchId}/${c.dial}.${c.bezel}.${c.bracelet}.${c.metal}`
}

export function useHashRouter() {
  useEffect(() => {
    const apply = () => {
      const r = parseHash()
      const s = useAtelier.getState()
      if (r.watch) s.setWatch(r.watch)
      if (r.watch && r.config) {
        const id = r.watch
        useAtelier.setState((st) => ({ configs: { ...st.configs, [id]: { ...st.configs[id], ...r.config } } }))
      }
      if (r.page !== s.page) {
        s.setPage(r.page)
        if (r.page === 'atelier') s.setMode('normal')
        window.scrollTo(0, 0)
      }
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])
  // garde le hash synchronisé avec le modèle courant dans l'atelier
  useEffect(
    () =>
      useAtelier.subscribe((s, prev) => {
        if (s.page === 'atelier' && s.watchId !== prev.watchId) history.replaceState(null, '', `#/atelier/${s.watchId}`)
      }),
    [],
  )
}
