import { useEffect } from 'react'
import { WATCH_BY_ID, type WatchId } from '../data/watches'
import { useAtelier } from '../store/useAtelier'

/** Routage par hash : `#/` (landing) et `#/atelier/<modèle>` — compatible hébergement statique. */
export function parseHash(hash = location.hash): { page: 'landing' | 'atelier'; watch?: WatchId } {
  const m = hash.match(/^#\/atelier(?:\/(\w+))?/)
  if (m) return { page: 'atelier', watch: m[1] && m[1] in WATCH_BY_ID ? (m[1] as WatchId) : undefined }
  return { page: 'landing' }
}

export function navigate(page: 'landing' | 'atelier', watch?: WatchId) {
  const id = watch ?? useAtelier.getState().watchId
  location.hash = page === 'atelier' ? `#/atelier/${id}` : '#/'
}

export function useHashRouter() {
  useEffect(() => {
    const apply = () => {
      const r = parseHash()
      const s = useAtelier.getState()
      if (r.watch) s.setWatch(r.watch)
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
