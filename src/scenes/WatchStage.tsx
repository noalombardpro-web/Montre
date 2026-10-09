import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ProceduralWatch } from '../models/ProceduralWatch'
import { GLBWatch } from '../models/GLBWatch'
import { WATCH_BY_ID } from '../data/watches'
import { anim, useAtelier } from '../store/useAtelier'
import { landingPose } from './landingKeyframes'
import { movementClock } from '../models/procedural/MovementParts'
import { GLB_SOURCE } from '../lib/env'

/**
 * Scène de la montre : interpolation des états (éclatement, mouvement)
 * et transition 3D fluide entre les modèles du catalogue.
 */
export function WatchStage({ high }: { high: boolean }) {
  const watchId = useAtelier((s) => s.watchId)
  const configs = useAtelier((s) => s.configs)
  const [shown, setShown] = useState(watchId)
  const group = useRef<THREE.Group>(null)
  const swap = useRef({ s: 0, dir: 1 })

  // Transition de modèle : sortie (glisse à gauche), échange, entrée (depuis la droite).
  // L'effet ne dépend que de watchId : l'échange interne ne doit pas interrompre la timeline.
  const shownRef = useRef(shown)
  useEffect(() => {
    if (watchId === shownRef.current) return
    const reduced = useAtelier.getState().reducedMotion
    const st = swap.current
    st.dir = 1
    const tl = gsap.timeline()
    tl.to(st, { s: 1, duration: reduced ? 0.01 : 0.55, ease: 'power2.in' })
    tl.add(() => {
      shownRef.current = watchId
      setShown(watchId)
      st.dir = -1
    })
    tl.to(st, { s: 0, duration: reduced ? 0.01 : 0.9, ease: 'power3.out' })
    return () => {
      tl.kill()
      // transition interrompue (changement rapide) : on finalise proprement
      if (shownRef.current !== watchId) {
        shownRef.current = watchId
        setShown(watchId)
      }
      st.s = 0
    }
  }, [watchId])

  useFrame((state, dt) => {
    const s = useAtelier.getState()
    const narrow = state.size.width < 760
    let te: number
    let tm: number
    if (s.page === 'landing') {
      const pose = landingPose(anim.scroll, narrow)
      te = pose.explode
      tm = pose.movement
    } else {
      te = s.explode
      tm = s.mode === 'movement' ? 1 : 0
    }
    const k = s.reducedMotion ? 30 : 3.2
    anim.explode = THREE.MathUtils.damp(anim.explode, te, k, dt)
    anim.movement = THREE.MathUtils.damp(anim.movement, tm, k, dt)
    if (Math.abs(anim.explode - te) < 1e-4) anim.explode = te
    movementClock.scale = s.page === 'atelier' && s.mode === 'movement' && s.slowMo ? 0.125 : 1

    const g = group.current
    if (!g) return
    const { s: sw, dir } = swap.current
    g.position.x = dir > 0 ? -120 * sw : 120 * sw
    g.rotation.y = (dir > 0 ? 1 : -1) * 1.1 * sw
    const sc = 1 - 0.18 * sw
    g.scale.setScalar(sc)
  })

  const def = WATCH_BY_ID[shown]
  return (
    <group ref={group}>
      {def.glb || GLB_SOURCE ? (
        <GlbFallback key={shown} fallback={<ProceduralWatch id={shown} config={configs[shown]} high={high} />}>
          <GLBWatch url={def.glb ?? `/models/${shown}.glb`} />
        </GlbFallback>
      ) : (
        <ProceduralWatch key={shown} id={shown} config={configs[shown]} high={high} />
      )}
    </group>
  )
}

/** Si le GLB est absent ou invalide, on retombe sur le modèle procédural. */
class GlbFallback extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
