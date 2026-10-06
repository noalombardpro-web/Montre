import { useEffect, useRef } from 'react'
import { useAtelier } from '../../store/useAtelier'

/** Curseur sur-mesure (anneau + point) — pointeurs fins uniquement, désactivé si mouvement réduit. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const reduced = useAtelier((s) => s.reducedMotion)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || reduced) return
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      const target = e.target as HTMLElement
      const active = !!target.closest?.('a,button,input,[role="slider"],label,select') || !!useAtelier.getState().hovered
      ring.current?.classList.toggle('is-active', active)
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const leave = () => ring.current && (ring.current.style.opacity = '0')
    const enter = () => ring.current && (ring.current.style.opacity = '1')
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    raf = requestAnimationFrame(loop)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <>
      <div ref={ring} className="cursor-ring hidden [@media(pointer:fine)]:block" aria-hidden />
      <div ref={dot} className="cursor-dot hidden [@media(pointer:fine)]:block" aria-hidden />
    </>
  )
}
