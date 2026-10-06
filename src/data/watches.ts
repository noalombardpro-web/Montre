import type { Bilingual } from './parts'

export type WatchId = 'datejust' | 'submariner' | 'daytona'
export type DialColor = 'black' | 'blue' | 'green' | 'champagne'
export type MetalId = 'steel' | 'yellow' | 'rose' | 'twotone'
export type BraceletId = 'oyster' | 'jubilee'
export type BezelStyle = 'fluted' | 'smooth' | 'dive' | 'tachy'

export interface BezelOption {
  id: string
  label: Bilingual
  style: BezelStyle
  /** Couleur de l'insert céramique (dive / tachy). `null` = insert métal. */
  insert?: string | null
}

export interface WatchConfig {
  dial: DialColor
  bezel: string
  bracelet: BraceletId
  metal: MetalId
}

export interface WatchDef {
  id: WatchId
  /** Nom générique — aucune marque déposée. */
  name: string
  family: Bilingual
  tagline: Bilingual
  intro: Bilingual
  specs: { label: Bilingual; value: Bilingual }[]
  features: { date: boolean; chrono: boolean; crownGuards: boolean }
  bezels: BezelOption[]
  dials: DialColor[]
  defaults: WatchConfig
  /** Optionnel : GLB à charger à la place du modèle procédural (nœuds nommés selon parts.json). */
  glb?: string
}

export const DIAL_COLORS: Record<DialColor, { label: Bilingual; base: string; print: string; sub: string }> = {
  black: { label: { fr: 'Noir laqué', en: 'Black lacquer' }, base: '#0b0c0e', print: '#eef0f2', sub: '#c9cdd3' },
  blue: { label: { fr: 'Bleu soleillé', en: 'Sunburst blue' }, base: '#1d3f86', print: '#f1f3f7', sub: '#0d1a3a' },
  green: { label: { fr: 'Vert soleillé', en: 'Sunburst green' }, base: '#1d5a3c', print: '#f0f3ef', sub: '#0b2418' },
  champagne: { label: { fr: 'Champagne', en: 'Champagne' }, base: '#cdb487', print: '#1d1a15', sub: '#2a241b' },
}

export const METALS: Record<MetalId, { label: Bilingual; short: Bilingual }> = {
  steel: { label: { fr: 'Acier 904L', en: '904L steel' }, short: { fr: 'Acier', en: 'Steel' } },
  yellow: { label: { fr: 'Or jaune 18 ct', en: '18 ct yellow gold' }, short: { fr: 'Or jaune', en: 'Yellow gold' } },
  rose: { label: { fr: 'Or rose 18 ct', en: '18 ct rose gold' }, short: { fr: 'Or rose', en: 'Rose gold' } },
  twotone: { label: { fr: 'Bicolore acier & or jaune', en: 'Two-tone steel & yellow gold' }, short: { fr: 'Bicolore', en: 'Two-tone' } },
}

export const BRACELETS: Record<BraceletId, { label: Bilingual; desc: Bilingual }> = {
  oyster: { label: { fr: 'Trois rangs', en: 'Three-row' }, desc: { fr: 'Maillons larges, sportifs', en: 'Broad, sporty links' } },
  jubilee: { label: { fr: 'Cinq rangs', en: 'Five-row' }, desc: { fr: 'Maillons fins, habillés', en: 'Fine, dressy links' } },
}

export const WATCHES: WatchDef[] = [
  {
    id: 'datejust',
    name: 'Datejust-style',
    family: { fr: 'Classique à date', en: 'Classic date watch' },
    tagline: { fr: "L'élégance du quotidien", en: 'Everyday elegance' },
    intro: {
      fr: 'Lunette cannelée, guichet de date sous loupe et bracelet cinq rangs : la montre de ville par excellence.',
      en: 'Fluted bezel, magnified date and five-row bracelet: the quintessential city watch.',
    },
    specs: [
      { label: { fr: 'Diamètre', en: 'Diameter' }, value: { fr: '40 mm', en: '40 mm' } },
      { label: { fr: 'Calibre', en: 'Calibre' }, value: { fr: 'AT-31 automatique', en: 'AT-31 automatic' } },
      { label: { fr: 'Réserve', en: 'Reserve' }, value: { fr: '70 h', en: '70 h' } },
      { label: { fr: 'Étanchéité', en: 'Water res.' }, value: { fr: '100 m', en: '100 m' } },
    ],
    features: { date: true, chrono: false, crownGuards: false },
    bezels: [
      { id: 'fluted', label: { fr: 'Cannelée', en: 'Fluted' }, style: 'fluted' },
      { id: 'smooth', label: { fr: 'Lisse bombée', en: 'Smooth domed' }, style: 'smooth' },
    ],
    dials: ['blue', 'black', 'green', 'champagne'],
    defaults: { dial: 'blue', bezel: 'fluted', bracelet: 'jubilee', metal: 'steel' },
  },
  {
    id: 'submariner',
    name: 'Submariner-style',
    family: { fr: 'Plongée professionnelle', en: 'Professional diver' },
    tagline: { fr: 'Conçue pour les abysses', en: 'Built for the deep' },
    intro: {
      fr: 'Lunette tournante unidirectionnelle en céramique, index luminescents surdimensionnés, étanche à 300 m.',
      en: 'Unidirectional ceramic dive bezel, oversized luminous markers, water-resistant to 300 m.',
    },
    specs: [
      { label: { fr: 'Diamètre', en: 'Diameter' }, value: { fr: '41 mm', en: '41 mm' } },
      { label: { fr: 'Calibre', en: 'Calibre' }, value: { fr: 'AT-32 automatique', en: 'AT-32 automatic' } },
      { label: { fr: 'Réserve', en: 'Reserve' }, value: { fr: '70 h', en: '70 h' } },
      { label: { fr: 'Étanchéité', en: 'Water res.' }, value: { fr: '300 m', en: '300 m' } },
    ],
    features: { date: true, chrono: false, crownGuards: true },
    bezels: [
      { id: 'black', label: { fr: 'Céramique noire', en: 'Black ceramic' }, style: 'dive', insert: '#0a0a0b' },
      { id: 'blue', label: { fr: 'Céramique bleue', en: 'Blue ceramic' }, style: 'dive', insert: '#14295a' },
      { id: 'green', label: { fr: 'Céramique verte', en: 'Green ceramic' }, style: 'dive', insert: '#0f3d27' },
    ],
    dials: ['black', 'blue', 'green', 'champagne'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'daytona',
    name: 'Daytona-style',
    family: { fr: 'Chronographe de course', en: 'Racing chronograph' },
    tagline: { fr: 'Le temps, au dixième', en: 'Time, to the tenth' },
    intro: {
      fr: 'Chronographe à trois compteurs, lunette tachymétrique et poussoirs vissés, né sur les circuits.',
      en: 'Three-register chronograph, tachymeter bezel and screw-down pushers, born on the race track.',
    },
    specs: [
      { label: { fr: 'Diamètre', en: 'Diameter' }, value: { fr: '40 mm', en: '40 mm' } },
      { label: { fr: 'Calibre', en: 'Calibre' }, value: { fr: 'AT-41 chronographe', en: 'AT-41 chronograph' } },
      { label: { fr: 'Réserve', en: 'Reserve' }, value: { fr: '72 h', en: '72 h' } },
      { label: { fr: 'Étanchéité', en: 'Water res.' }, value: { fr: '100 m', en: '100 m' } },
    ],
    features: { date: false, chrono: true, crownGuards: false },
    bezels: [
      { id: 'ceramic', label: { fr: 'Céramique noire', en: 'Black ceramic' }, style: 'tachy', insert: '#0a0a0b' },
      { id: 'metal', label: { fr: 'Métal gravé', en: 'Engraved metal' }, style: 'tachy', insert: null },
    ],
    dials: ['champagne', 'black', 'blue', 'green'],
    defaults: { dial: 'black', bezel: 'ceramic', bracelet: 'oyster', metal: 'steel' },
  },
]

export const WATCH_BY_ID: Record<WatchId, WatchDef> = Object.fromEntries(WATCHES.map((w) => [w.id, w])) as Record<
  WatchId,
  WatchDef
>
