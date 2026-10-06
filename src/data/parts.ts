import raw from './parts.json'
import type { WatchId } from './watches'

export type Lang = 'fr' | 'en'
export type Bilingual = { fr: string; en: string }
export type PartGroup = 'exterior' | 'movement'

export interface PartMeta {
  id: string
  group: PartGroup
  models: string[]
  explode: [number, number, number]
  order: number
  anchor: [number, number, number]
  metal?: boolean
  name: Bilingual
  material: Bilingual
  function: Bilingual
  description: Bilingual
  funFact: Bilingual
}

export const PARTS = raw.parts as PartMeta[]
export const PART_BY_ID: Record<string, PartMeta> = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const MAX_ORDER = Math.max(...PARTS.map((p) => p.order))

export function partsFor(watch: WatchId): PartMeta[] {
  return PARTS.filter((p) => p.models.includes('*') || p.models.includes(watch))
}
