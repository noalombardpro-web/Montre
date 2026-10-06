import { Leva } from 'leva'

/** Panneau Leva visible en dev avec `?debug` dans l'URL. */
export default function LevaRoot() {
  const show = new URLSearchParams(location.search).has('debug')
  return <Leva hidden={!show} collapsed={false} titleBar={{ title: 'Watch Atelier · debug' }} />
}
