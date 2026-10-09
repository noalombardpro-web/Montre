import raw from './parts.json'
import type { WatchConfig, WatchDef } from './watches'

export type Lang = 'fr' | 'en'
export type Bilingual = { fr: string; en: string }
export type PartGroup = 'exterior' | 'movement'
export type Requirement = 'cyclops' | 'insert' | 'date' | 'day' | 'chrono' | 'subdials' | 'gmt' | 'moon' | 'centerSeconds'

export interface PartMeta {
  id: string
  group: PartGroup
  requires?: Requirement
  explode: [number, number, number]
  order: number
  anchor: [number, number, number]
  metal?: boolean
  name: Bilingual
  material: Bilingual
  function: Bilingual
  description: Bilingual
  funFact: Bilingual
  /** Comment ça marche. */
  howItWorks?: Bilingual
  /** Comment la pièce est montée / emboîtée. */
  assembly?: Bilingual
  tools?: Bilingual[]
  /** Pièces en interaction directe. */
  links?: string[]
}

export const PARTS = raw.parts as PartMeta[]
export const PART_BY_ID: Record<string, PartMeta> = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const MAX_ORDER = Math.max(...PARTS.map((p) => p.order))

const INSERTS = ['dive', 'tachy', 'gmt', 'gmt-metal', 'slide']

/** La montre (dans cette configuration) possède-t-elle cette pièce ? */
export function hasPart(p: PartMeta, w: WatchDef, cfg?: WatchConfig) {
  const s = w.style
  switch (p.requires) {
    case undefined:
      return true
    case 'cyclops':
      return !!s.cyclops && !!s.date
    case 'insert': {
      const b = w.bezels.find((x) => x.id === cfg?.bezel) ?? w.bezels[0]
      return INSERTS.includes(b.style)
    }
    case 'date':
      return !!s.date
    case 'day':
      return !!s.day
    case 'chrono':
      return !!s.chrono
    case 'subdials':
      return !!s.chrono || !!s.smallSeconds
    case 'gmt':
      return !!s.gmt
    case 'moon':
      return !!s.moonphase
    case 'centerSeconds':
      return !!s.chrono || !s.smallSeconds
  }
}

export function partsFor(w: WatchDef, cfg?: WatchConfig): PartMeta[] {
  return PARTS.filter((p) => hasPart(p, w, cfg))
}
