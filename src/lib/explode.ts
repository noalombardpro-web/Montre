import { MAX_ORDER } from '../data/parts'

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Fenêtre de décalage : chaque pièce démarre un peu après la précédente. */
const STAGGER = 0.45

/** Progression d'éclatement 0..1 d'une pièce selon son rang (stagger + easing). */
export function staggered(e: number, order: number) {
  const n = MAX_ORDER + 1
  const step = STAGGER / n
  const span = 1 - STAGGER
  const t = Math.min(Math.max((e - order * step) / span, 0), 1)
  return easeInOutCubic(t)
}
