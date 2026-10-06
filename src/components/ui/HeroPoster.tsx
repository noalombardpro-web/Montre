import { useEffect, useState } from 'react'
import poster from '../../data/poster.json'
import { useAtelier } from '../../store/useAtelier'
import { LANDING_KEYS, MOBILE_DISTANCE } from '../../scenes/landingKeyframes'

/**
 * Image de façade : rendu 3D pré-calculé (scripts/make-poster.mjs) placé exactement
 * à l'emplacement où la montre 3D apparaîtra, puis fondu enchaîné vers le canvas.
 * Les positions sont en vh car la projection perspective est proportionnelle à la hauteur.
 */
const D = poster.desktop
// Projection de la pose du hero : hauteur visible = 2·d·tan(fov/2), fov = 30°
const hero = LANDING_KEYS[0]
const dist = Math.hypot(hero.pos[0] - hero.target[0], hero.pos[1] - hero.target[1], hero.pos[2] - hero.target[2])
const visible = 2 * dist * Math.tan((15 * Math.PI) / 180)
const ORIGIN_X = (-hero.focal[0] / visible) * 100
const MOBILE_K = MOBILE_DISTANCE
const MOBILE_UP = (hero.focalMobile[1] / (visible * MOBILE_K)) * 100

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
      srcSet="/poster-760.webp 760w, /poster.webp 1400w"
      sizes={narrow ? '45vh' : '71vh'}
      alt=""
      aria-hidden
      fetchPriority="high"
      decoding="async"
      className={`hero-poster ${ready ? 'is-hidden' : ''}`}
      style={style}
    />
  )
}
