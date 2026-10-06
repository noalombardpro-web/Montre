import { useEffect, useState } from 'react'
import poster from '../../data/poster.json'
import { useAtelier } from '../../store/useAtelier'

/**
 * Image de façade : rendu 3D pré-calculé (scripts/make-poster.mjs) placé exactement
 * à l'emplacement où la montre 3D apparaîtra, puis fondu enchaîné vers le canvas.
 * Les positions sont en vh car la projection perspective est proportionnelle à la hauteur.
 */
const D = poster.desktop
// pose du hero : décalage focal 24 unités, hauteur visible 74,2 (desktop) / 115 (mobile, distance ×1,55)
const ORIGIN_X = 32.35
const MOBILE_K = 1.55
const MOBILE_UP = 20.87

export function HeroPoster() {
  const ready = useAtelier((s) => s.sceneReady)
  const [narrow, setNarrow] = useState(() => innerWidth < 760)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const on = () => setNarrow(innerWidth < 760)
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  useEffect(() => {
    if (!ready) return
    const id = setTimeout(() => setGone(true), 1600)
    return () => clearTimeout(id)
  }, [ready])
  if (gone) return null

  let style: React.CSSProperties
  if (!narrow) {
    style = { left: `calc(50vw + ${D.left}vh)`, top: `${D.top}vh`, width: `${D.width}vh`, height: `${D.height}vh` }
  } else {
    const rx = (D.left + D.width / 2 - ORIGIN_X) / MOBILE_K
    const ry = (D.top + D.height / 2 - 50) / MOBILE_K
    const w = D.width / MOBILE_K
    const h = D.height / MOBILE_K
    style = { left: `calc(50vw + ${rx - w / 2}vh)`, top: `${50 - MOBILE_UP + ry - h / 2}vh`, width: `${w}vh`, height: `${h}vh` }
  }
  return (
    <img
      src="/poster.webp"
      alt=""
      aria-hidden
      fetchPriority="high"
      decoding="async"
      className={`hero-poster ${ready ? 'is-hidden' : ''}`}
      style={style}
    />
  )
}
