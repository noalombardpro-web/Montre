import { lazy, Suspense, useEffect, useState } from 'react'
import { useAtelier } from './store/useAtelier'
import { useHashRouter } from './lib/router'
import { hasWebGL2 } from './lib/webgl'
import { POSTER_MODE } from './lib/env'
import { Loader } from './components/ui/Loader'
import { Cursor } from './components/ui/Cursor'
import { WebGLFallback } from './components/ui/WebGLFallback'
import { Landing } from './pages/Landing'
import { Atelier } from './pages/Atelier'
import { Collection } from './pages/Collection'
import { TickSound } from './components/ui/TickSound'

// Le moteur 3D (three + R3F + postprocessing) est chargé à part : la page s'affiche immédiatement.
const Experience = lazy(() => import('./scenes/Experience'))
const LevaRoot = import.meta.env.DEV ? lazy(() => import('./debug/LevaRoot')) : null

/**
 * Façade : sur la landing, le moteur 3D n'est chargé qu'à la première interaction
 * (ou après quelques secondes d'inactivité) ; un poster haute définition le remplace d'ici là.
 * Dans l'atelier, il est chargé immédiatement.
 */
function use3DTrigger(page: string) {
  const [go, setGo] = useState(page === 'atelier' || POSTER_MODE)
  useEffect(() => {
    if (go) return
    if (page === 'atelier') {
      setGo(true)
      return
    }
    const fire = () => setGo(true)
    const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, fire, { once: true, passive: true }))
    // sans interaction : chargement différé (plus long sur mobile, réseau souvent plus lent)
    const coarse = matchMedia('(pointer: coarse)').matches
    const timer = window.setTimeout(fire, coarse ? 7000 : 3500)
    return () => {
      events.forEach((e) => window.removeEventListener(e, fire))
      clearTimeout(timer)
    }
  }, [go, page])
  return go
}

export default function App() {
  useHashRouter()
  const page = useAtelier((s) => s.page)
  const lang = useAtelier((s) => s.lang)
  const [webgl] = useState(hasWebGL2)
  const load3D = use3DTrigger(page)

  useEffect(() => {
    document.body.classList.toggle('is-atelier', page === 'atelier')
    document.body.classList.toggle('is-collection', page === 'collection')
  }, [page])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <>
      {!POSTER_MODE && (
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] glass px-4 py-2 text-sm">
          {lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}
        </a>
      )}
      {webgl ? (
        load3D && (
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        )
      ) : (
        <WebGLFallback />
      )}
      {!POSTER_MODE && (
        <main id="main" className="relative z-10">
          {page === 'landing' ? <Landing poster={webgl} /> : page === 'collection' ? <Collection /> : <Atelier />}
        </main>
      )}
      {webgl && !POSTER_MODE && page === 'atelier' && <Loader />}
      {!POSTER_MODE && <Cursor />}
      <TickSound />
      {LevaRoot && (
        <Suspense fallback={null}>
          <LevaRoot />
        </Suspense>
      )}
    </>
  )
}
