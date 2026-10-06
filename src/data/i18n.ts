import type { Lang } from './parts'

const dict = {
  enter: { fr: "Entrer dans l'atelier", en: 'Enter the atelier' },
  explore: { fr: 'Explorer', en: 'Explore' },
  catalogue: { fr: 'Collection', en: 'Collection' },
  modes: { fr: 'Modes', en: 'Modes' },
  normal: { fr: 'Normal', en: 'Normal' },
  exploded: { fr: 'Éclaté', en: 'Exploded' },
  movement: { fr: 'Mouvement', en: 'Movement' },
  xray: { fr: 'Rayons X', en: 'X-ray' },
  explode: { fr: 'Éclatement', en: 'Explosion' },
  autoRotate: { fr: 'Rotation auto', en: 'Auto-rotate' },
  hotspots: { fr: 'Repères', en: 'Hotspots' },
  wireframe: { fr: 'Fil de fer', en: 'Wireframe' },
  screenshot: { fr: 'Capture PNG', en: 'PNG capture' },
  configure: { fr: 'Configurer', en: 'Configure' },
  dial: { fr: 'Cadran', en: 'Dial' },
  bezel: { fr: 'Lunette', en: 'Bezel' },
  bracelet: { fr: 'Bracelet', en: 'Bracelet' },
  metal: { fr: 'Métal', en: 'Metal' },
  material: { fr: 'Matériau', en: 'Material' },
  role: { fr: 'Rôle', en: 'Role' },
  funFact: { fr: 'Le saviez-vous ?', en: 'Did you know?' },
  isolate: { fr: 'Isoler', en: 'Isolate' },
  showAll: { fr: 'Tout afficher', en: 'Show all' },
  close: { fr: 'Fermer', en: 'Close' },
  prev: { fr: 'Pièce précédente', en: 'Previous part' },
  next: { fr: 'Pièce suivante', en: 'Next part' },
  parts: { fr: 'Pièces', en: 'Parts' },
  shortcuts: { fr: 'Raccourcis clavier', en: 'Keyboard shortcuts' },
  loading: { fr: 'Assemblage du calibre', en: 'Assembling the calibre' },
  back: { fr: 'Accueil', en: 'Home' },
  resetView: { fr: 'Recentrer', en: 'Reset view' },
  noWebgl: { fr: 'Votre navigateur ne prend pas en charge WebGL.', en: 'Your browser does not support WebGL.' },
} as const

export type Key = keyof typeof dict
export const t = (k: Key, lang: Lang) => dict[k][lang]
export const tb = (b: { fr: string; en: string }, lang: Lang) => b[lang]
