import { lazy, Suspense, useEffect, useState } from 'react'
import { useAtelier } from './store/useAtelier'
import { useHashRouter } from './lib/router'
import { hasWebGL2 } from './lib/webgl'
import { Loader } from './components/ui/Loader'
import { Cursor } from './components/ui/Cursor'
import { WebGLFallback } from './components/ui/WebGLFallback'
import { Landing } from './pages/Landing'
import { Atelier } from './pages/Atelier'

// Le moteur 3D (three + R3F + postprocessing) est chargé à part : la page s'affiche immédiatement.
const Experience = lazy(() => import('./scenes/Experience'))
const LevaRoot = import.meta.env.DEV ? lazy(() => import('./debug/LevaRoot')) : null

export default function App() {
  useHashRouter()
  const page = useAtelier((s) => s.page)
  const lang = useAtelier((s) => s.lang)
  const [webgl] = useState(hasWebGL2)

  useEffect(() => {
    document.body.classList.toggle('is-atelier', page === 'atelier')
  }, [page])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] glass px-4 py-2 text-sm">
        {lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}
      </a>
      {webgl ? (
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      ) : (
        <WebGLFallback />
      )}
      <main id="main" className="relative z-10">
        {page === 'landing' ? <Landing /> : <Atelier />}
      </main>
      {webgl && <Loader />}
      <Cursor />
      {LevaRoot && (
        <Suspense fallback={null}>
          <LevaRoot />
        </Suspense>
      )}
    </>
  )
}
