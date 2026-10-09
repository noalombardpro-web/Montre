import type { MetalId } from './watches'

/** Teintes de base des métaux (sans dépendance à three.js : utilisable dans l'UI). */
export type BaseMetal = Exclude<MetalId, 'twotone' | 'twotone-rose'>
export const METAL_COLOR: Record<BaseMetal, string> = {
  steel: '#c9ccd1',
  titanium: '#a9adb3',
  yellow: '#f2c76e',
  rose: '#eab49c',
  white: '#dfe1e4',
  platinum: '#e2e4e8',
}
