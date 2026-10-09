import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { partsFor } from '../../data/parts'
import type { WatchConfig, WatchDef } from '../../data/watches'
import { staggered } from '../../lib/explode'
import { anim } from '../../store/useAtelier'

/**
 * Lignes de liaison (axes de montage) : un trait pointillé fin relie la position
 * assemblée de chaque pièce à sa position éclatée.
 */
export function ExplodeLines({ watch, config }: { watch: WatchDef; config: WatchConfig }) {
  const parts = useMemo(() => partsFor(watch, config).filter((p) => p.explode.some((v) => v !== 0)), [watch, config])
  const { geo, mat, line } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(parts.length * 6), 3))
    const mat = new THREE.LineDashedMaterial({
      color: '#d8be86',
      dashSize: 1.6,
      gapSize: 1.4,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const line = new THREE.LineSegments(geo, mat)
    line.frustumCulled = false
    line.renderOrder = 5
    return { geo, mat, line }
  }, [parts])

  useFrame(() => {
    const e = anim.explode
    mat.opacity = THREE.MathUtils.smoothstep(e, 0.05, 0.6) * 0.55
    line.visible = mat.opacity > 0.005
    if (!line.visible) return
    const pos = geo.attributes.position as THREE.BufferAttribute
    parts.forEach((p, i) => {
      const k = staggered(e, p.order)
      const [ax, ay, az] = p.anchor
      const [ex, ey, ez] = p.explode
      pos.setXYZ(i * 2, ax, ay, az)
      pos.setXYZ(i * 2 + 1, ax + ex * k, ay + ey * k, az + ez * k)
    })
    pos.needsUpdate = true
    line.computeLineDistances()
  })

  return <primitive object={line} />
}
