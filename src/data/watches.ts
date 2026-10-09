import type { Bilingual, Lang } from './parts'

/* ================================================================================
 * Catalogue : marques réelles, références réelles, données techniques publiques.
 * Les montres 3D sont des interprétations procédurales : les noms de marques et de
 * modèles sont utilisés à titre descriptif (usage nominatif) ; aucun logo ni
 * marque figurative n'est reproduit sur les cadrans. Données indicatives.
 * ================================================================================ */

export type WatchId = string

export type BrandId =
  | 'rolex'
  | 'patek'
  | 'ap'
  | 'vc'
  | 'omega'
  | 'tudor'
  | 'iwc'
  | 'breitling'
  | 'zenith'
  | 'jlc'
  | 'lange'
  | 'gs'
  | 'blancpain'
  | 'breguet'
  | 'cartier'
  | 'tag'

export const BRANDS: Record<BrandId, { name: string; founded: number; city: string }> = {
  rolex: { name: 'Rolex', founded: 1905, city: 'Genève' },
  patek: { name: 'Patek Philippe', founded: 1839, city: 'Genève' },
  ap: { name: 'Audemars Piguet', founded: 1875, city: 'Le Brassus' },
  vc: { name: 'Vacheron Constantin', founded: 1755, city: 'Genève' },
  omega: { name: 'Omega', founded: 1848, city: 'Bienne' },
  tudor: { name: 'Tudor', founded: 1926, city: 'Genève' },
  iwc: { name: 'IWC Schaffhausen', founded: 1868, city: 'Schaffhouse' },
  breitling: { name: 'Breitling', founded: 1884, city: 'Granges' },
  zenith: { name: 'Zenith', founded: 1865, city: 'Le Locle' },
  jlc: { name: 'Jaeger-LeCoultre', founded: 1833, city: 'Le Sentier' },
  lange: { name: 'A. Lange & Söhne', founded: 1845, city: 'Glashütte' },
  gs: { name: 'Grand Seiko', founded: 1960, city: 'Shizukuishi' },
  blancpain: { name: 'Blancpain', founded: 1735, city: 'Le Brassus' },
  breguet: { name: 'Breguet', founded: 1775, city: "L'Abbaye" },
  cartier: { name: 'Cartier', founded: 1847, city: 'Paris' },
  tag: { name: 'TAG Heuer', founded: 1860, city: 'La Chaux-de-Fonds' },
}

export type Category = 'diver' | 'chrono' | 'gmt' | 'dress' | 'sport' | 'pilot' | 'field'
export const CATEGORIES: Record<Category, Bilingual> = {
  diver: { fr: 'Plongée', en: 'Diver' },
  chrono: { fr: 'Chronographe', en: 'Chronograph' },
  gmt: { fr: 'Voyage / GMT', en: 'Travel / GMT' },
  dress: { fr: 'Habillée', en: 'Dress' },
  sport: { fr: 'Sport-chic', en: 'Luxury sport' },
  pilot: { fr: 'Aviation', en: 'Pilot' },
  field: { fr: 'Exploration', en: 'Field' },
}

/* ------------------------------- Options visuelles ------------------------------- */

export type DialColor =
  | 'black'
  | 'blue'
  | 'navy'
  | 'green'
  | 'champagne'
  | 'white'
  | 'silver'
  | 'slate'
  | 'brown'
  | 'salmon'
  | 'cream'
  | 'turquoise'
  | 'yellow'
  | 'red'
  | 'ice'
  | 'burgundy'

export const DIAL_COLORS: Record<DialColor, { label: Bilingual; base: string; print: string; sub: string }> = {
  black: { label: { fr: 'Noir', en: 'Black' }, base: '#0b0c0e', print: '#eef0f2', sub: '#c9cdd3' },
  blue: { label: { fr: 'Bleu soleillé', en: 'Sunburst blue' }, base: '#1d3f86', print: '#f1f3f7', sub: '#0d1a3a' },
  navy: { label: { fr: 'Bleu nuit', en: 'Navy' }, base: '#111c38', print: '#eef1f6', sub: '#2a3a63' },
  green: { label: { fr: 'Vert', en: 'Green' }, base: '#1d5a3c', print: '#f0f3ef', sub: '#0b2418' },
  champagne: { label: { fr: 'Champagne', en: 'Champagne' }, base: '#cdb487', print: '#1d1a15', sub: '#2a241b' },
  white: { label: { fr: 'Blanc', en: 'White' }, base: '#eceae4', print: '#16171a', sub: '#1a1b1e' },
  silver: { label: { fr: 'Argenté', en: 'Silver' }, base: '#c9ccd1', print: '#16171a', sub: '#e3e5e8' },
  slate: { label: { fr: 'Ardoise', en: 'Slate' }, base: '#4a4f57', print: '#eef0f2', sub: '#2b2f35' },
  brown: { label: { fr: 'Chocolat', en: 'Chocolate' }, base: '#3d2618', print: '#f1e6d4', sub: '#24160d' },
  salmon: { label: { fr: 'Saumon', en: 'Salmon' }, base: '#e3a68a', print: '#2a1810', sub: '#c98c70' },
  cream: { label: { fr: 'Émail crème', en: 'Cream enamel' }, base: '#f2ecdc', print: '#1a1a1d', sub: '#e6dfcb' },
  turquoise: { label: { fr: 'Turquoise', en: 'Turquoise' }, base: '#5fc3c0', print: '#0f2524', sub: '#47a8a5' },
  yellow: { label: { fr: 'Jaune', en: 'Yellow' }, base: '#e8c33b', print: '#1d1a10', sub: '#c9a728' },
  red: { label: { fr: 'Corail', en: 'Coral red' }, base: '#c8473c', print: '#fff3ef', sub: '#9d3027' },
  ice: { label: { fr: 'Bleu glacier', en: 'Ice blue' }, base: '#bcd6e6', print: '#152330', sub: '#8fb4c9' },
  burgundy: { label: { fr: 'Bordeaux', en: 'Burgundy' }, base: '#4b1420', print: '#f3e6e8', sub: '#2e0c13' },
}

export type MetalId = 'steel' | 'titanium' | 'yellow' | 'rose' | 'white' | 'platinum' | 'twotone' | 'twotone-rose'

export const METALS: Record<MetalId, { label: Bilingual; short: Bilingual }> = {
  steel: { label: { fr: 'Acier 904L / 316L', en: '904L / 316L steel' }, short: { fr: 'Acier', en: 'Steel' } },
  titanium: { label: { fr: 'Titane grade 5', en: 'Grade 5 titanium' }, short: { fr: 'Titane', en: 'Titanium' } },
  yellow: { label: { fr: 'Or jaune 18 ct', en: '18 ct yellow gold' }, short: { fr: 'Or jaune', en: 'Yellow gold' } },
  rose: { label: { fr: 'Or rose 18 ct', en: '18 ct rose gold' }, short: { fr: 'Or rose', en: 'Rose gold' } },
  white: { label: { fr: 'Or gris 18 ct', en: '18 ct white gold' }, short: { fr: 'Or gris', en: 'White gold' } },
  platinum: { label: { fr: 'Platine 950', en: '950 platinum' }, short: { fr: 'Platine', en: 'Platinum' } },
  twotone: { label: { fr: 'Bicolore acier & or jaune', en: 'Steel & yellow gold' }, short: { fr: 'Bicolore', en: 'Two-tone' } },
  'twotone-rose': { label: { fr: 'Bicolore acier & or rose', en: 'Steel & rose gold' }, short: { fr: 'Bicolore rose', en: 'Two-tone rose' } },
}

export type BraceletId =
  | 'oyster'
  | 'jubilee'
  | 'president'
  | 'integrated'
  | 'leather-brown'
  | 'leather-black'
  | 'leather-blue'
  | 'rubber-black'
  | 'rubber-blue'
  | 'canvas'

export const BRACELETS: Record<BraceletId, { label: Bilingual; desc: Bilingual; kind: 'metal' | 'strap' }> = {
  oyster: { label: { fr: 'Trois rangs', en: 'Three-row' }, desc: { fr: 'Maillons larges, sportifs', en: 'Broad, sporty links' }, kind: 'metal' },
  jubilee: { label: { fr: 'Cinq rangs', en: 'Five-row' }, desc: { fr: 'Maillons fins, habillés', en: 'Fine, dressy links' }, kind: 'metal' },
  president: { label: { fr: 'Trois rangs arrondis', en: 'Rounded three-piece' }, desc: { fr: 'Maillons semi-circulaires, or massif', en: 'Semi-circular solid gold links' }, kind: 'metal' },
  integrated: { label: { fr: 'Intégré', en: 'Integrated' }, desc: { fr: 'Maillons en H, dans la continuité du boîtier', en: 'H-links flowing from the case' }, kind: 'metal' },
  'leather-brown': { label: { fr: 'Alligator brun', en: 'Brown alligator' }, desc: { fr: 'Cuir cousu main, boucle ardillon', en: 'Hand-stitched leather, tang buckle' }, kind: 'strap' },
  'leather-black': { label: { fr: 'Alligator noir', en: 'Black alligator' }, desc: { fr: 'Cuir cousu main, boucle ardillon', en: 'Hand-stitched leather, tang buckle' }, kind: 'strap' },
  'leather-blue': { label: { fr: 'Alligator bleu', en: 'Blue alligator' }, desc: { fr: 'Cuir cousu main, boucle ardillon', en: 'Hand-stitched leather, tang buckle' }, kind: 'strap' },
  'rubber-black': { label: { fr: 'Caoutchouc noir', en: 'Black rubber' }, desc: { fr: 'Élastomère à âme métallique', en: 'Elastomer with metal core' }, kind: 'strap' },
  'rubber-blue': { label: { fr: 'Caoutchouc bleu', en: 'Blue rubber' }, desc: { fr: 'Élastomère à âme métallique', en: 'Elastomer with metal core' }, kind: 'strap' },
  canvas: { label: { fr: 'Toile de voile', en: 'Sailcloth' }, desc: { fr: 'Toile technique, boucle ardillon', en: 'Technical canvas, tang buckle' }, kind: 'strap' },
}

export type BezelStyle =
  | 'fluted'
  | 'smooth'
  | 'thin'
  | 'dive'
  | 'tachy'
  | 'gmt'
  | 'gmt-metal'
  | 'octagon'
  | 'hexagon'
  | 'coin'
  | 'slide'

export interface BezelOption {
  id: string
  label: Bilingual
  style: BezelStyle
  /** Couleur de l'insert (céramique/aluminium). `null` = insert métal. Pour un GMT : moitié haute. */
  insert?: string | null
  /** Moitié basse d'un insert GMT bicolore. */
  insert2?: string
  /** Lunette octogonale : vis apparentes. */
  screws?: boolean
}

export type IndexStyle = 'baton' | 'dive' | 'short' | 'explorer' | 'arabic' | 'roman' | 'obus' | 'stick'
export type HandStyle = 'dauphine' | 'sword' | 'baton' | 'breguet' | 'leaf' | 'pencil'
export type DialPattern = 'sunburst' | 'lacquer' | 'matte' | 'tapisserie' | 'horizontal' | 'guilloche' | 'waves' | 'grain' | 'enamel'

export interface WatchStyle {
  /** Diamètre du boîtier en mm (le modèle de référence mesure 40 mm). */
  diameter: number
  indices: IndexStyle
  hands: HandStyle
  handColor?: 'metal' | 'blued' | 'gold'
  pattern: DialPattern
  lugs: 'classic' | 'integrated'
  crownGuards?: boolean
  date?: boolean
  cyclops?: boolean
  /** Jour de la semaine en toutes lettres à 12 h. */
  day?: boolean
  chrono?: 'tri' | 'vertical'
  gmt?: boolean
  gmtColor?: string
  smallSeconds?: boolean
  moonphase?: boolean
  lume?: boolean
  /** Impressions génériques du cadran (aucune marque). */
  print: { top: string[]; bottom: string[] }
}

export interface WatchConfig {
  dial: DialColor
  bezel: string
  bracelet: BraceletId
  metal: MetalId
}

export interface WatchDef {
  id: WatchId
  brand: BrandId
  /** Nom du modèle (ex. « Submariner Date »). */
  name: string
  reference: string
  year: number
  category: Category
  tagline: Bilingual
  intro: Bilingual
  specs: { calibre: string; movement: 'auto' | 'manual' | 'springdrive'; reserve: number; water: number }
  style: WatchStyle
  bezels: BezelOption[]
  dials: DialColor[]
  bracelets: BraceletId[]
  metals: MetalId[]
  defaults: WatchConfig
  featured?: boolean
  /** Optionnel : GLB à charger à la place du modèle procédural (nœuds nommés selon parts.json). */
  glb?: string
}

/* ------------------------------- Raccourcis de saisie ------------------------------- */

const B = {
  fluted: { id: 'fluted', label: { fr: 'Cannelée', en: 'Fluted' }, style: 'fluted' } as BezelOption,
  smooth: { id: 'smooth', label: { fr: 'Lisse bombée', en: 'Smooth domed' }, style: 'smooth' } as BezelOption,
  thin: { id: 'thin', label: { fr: 'Fine polie', en: 'Slim polished' }, style: 'thin' } as BezelOption,
  coin: { id: 'coin', label: { fr: 'Clous de Paris', en: 'Hobnail' }, style: 'coin' } as BezelOption,
  dive: (id: string, fr: string, en: string, insert: string): BezelOption => ({ id, label: { fr, en }, style: 'dive', insert }),
  gmt: (id: string, fr: string, en: string, top: string, bottom: string): BezelOption => ({ id, label: { fr, en }, style: 'gmt', insert: top, insert2: bottom }),
  tachy: (id: string, fr: string, en: string, insert: string | null): BezelOption => ({ id, label: { fr, en }, style: 'tachy', insert }),
  octagon: { id: 'octagon', label: { fr: 'Octogonale à vis', en: 'Octagonal, screwed' }, style: 'octagon', screws: true } as BezelOption,
  porthole: { id: 'porthole', label: { fr: 'Octogone adouci', en: 'Rounded octagon' }, style: 'octagon', screws: false } as BezelOption,
}

const AUTO = 'auto' as const
const MANUAL = 'manual' as const
const T = (fr: string, en: string): Bilingual => ({ fr, en })

const METAL_BR: BraceletId[] = ['oyster', 'jubilee']
const LEATHERS: BraceletId[] = ['leather-brown', 'leather-black', 'leather-blue']

/* ----------------------------------- Collection ----------------------------------- */

export const WATCHES: WatchDef[] = [
  /* ================================ ROLEX ================================ */
  {
    id: 'rolex-submariner-date',
    brand: 'rolex',
    name: 'Submariner Date',
    reference: '126610LN',
    year: 2020,
    category: 'diver',
    featured: true,
    tagline: T('La référence des montres de plongée', 'The benchmark dive watch'),
    intro: T(
      "Née en 1953, la Submariner a défini les codes de la montre de plongée : lunette tournante graduée, index luminescents surdimensionnés, couronne vissée. Cette génération de 41 mm adopte le calibre 3235.",
      'Born in 1953, the Submariner defined the dive-watch codes: graduated rotating bezel, oversized luminous markers, screw-down crown. This 41 mm generation adopts calibre 3235.',
    ),
    specs: { calibre: '3235', movement: AUTO, reserve: 70, water: 300 },
    style: { diameter: 41, indices: 'dive', hands: 'sword', pattern: 'lacquer', lugs: 'classic', crownGuards: true, date: true, cyclops: true, print: { top: ['AUTOMATIC'], bottom: ['300 m ⁄ 1000 ft', 'CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.dive('black', 'Céramique noire', 'Black ceramic', '#0a0a0b'), B.dive('green', 'Céramique verte', 'Green ceramic', '#0f3d27'), B.dive('blue', 'Céramique bleue', 'Blue ceramic', '#14295a')],
    dials: ['black', 'blue', 'green'],
    bracelets: ['oyster'],
    metals: ['steel', 'twotone', 'yellow', 'white'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-submariner',
    brand: 'rolex',
    name: 'Submariner',
    reference: '124060',
    year: 2020,
    category: 'diver',
    tagline: T('La pureté sans date', 'Pure, no date'),
    intro: T('La version sans guichet de date, au cadran parfaitement symétrique, fidèle aux premières Submariner.', 'The no-date version with a perfectly symmetrical dial, faithful to the earliest Submariners.'),
    specs: { calibre: '3230', movement: AUTO, reserve: 70, water: 300 },
    style: { diameter: 41, indices: 'dive', hands: 'sword', pattern: 'lacquer', lugs: 'classic', crownGuards: true, print: { top: ['AUTOMATIC'], bottom: ['300 m ⁄ 1000 ft'] } },
    bezels: [B.dive('black', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['black'],
    bracelets: ['oyster'],
    metals: ['steel'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-gmt-master-ii',
    brand: 'rolex',
    name: 'GMT-Master II',
    reference: '126710BLRO',
    year: 2018,
    category: 'gmt',
    featured: true,
    tagline: T('Deux fuseaux horaires, une lunette iconique', 'Two time zones, one iconic bezel'),
    intro: T(
      "Conçue en 1955 pour les pilotes de ligne, la GMT-Master affiche un second fuseau grâce à une aiguille 24 h et à une lunette bicolore jour/nuit, ici en céramique rouge et bleue.",
      'Designed in 1955 for airline pilots, the GMT-Master shows a second time zone with a 24-hour hand and a two-tone day/night bezel, here in red and blue ceramic.',
    ),
    specs: { calibre: '3285', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 40, indices: 'dive', hands: 'sword', pattern: 'lacquer', lugs: 'classic', crownGuards: true, date: true, cyclops: true, gmt: true, gmtColor: '#c8322a', print: { top: ['GMT', 'AUTOMATIC'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [
      B.gmt('pepsi', 'Rouge / bleu', 'Red / blue', '#1d2f6e', '#a52a2a'),
      B.gmt('batman', 'Bleu / noir', 'Blue / black', '#0c0c0e', '#1c3266'),
      B.gmt('rootbeer', 'Brun / noir', 'Brown / black', '#0c0c0e', '#4a2c1c'),
      B.gmt('sprite', 'Vert / noir', 'Green / black', '#0c0c0e', '#1f5236'),
    ],
    dials: ['black'],
    bracelets: ['jubilee', 'oyster'],
    metals: ['steel', 'twotone-rose', 'white'],
    defaults: { dial: 'black', bezel: 'pepsi', bracelet: 'jubilee', metal: 'steel' },
  },
  {
    id: 'rolex-daytona',
    brand: 'rolex',
    name: 'Cosmograph Daytona',
    reference: '126500LN',
    year: 2023,
    category: 'chrono',
    featured: true,
    tagline: T('Le chronographe des circuits', 'The race-track chronograph'),
    intro: T(
      "Lancé en 1963 pour les pilotes, le Daytona mesure les temps au cinquième de seconde et la vitesse moyenne grâce à sa lunette tachymétrique. Le calibre 4131 a été dévoilé en 2023.",
      'Launched in 1963 for racing drivers, the Daytona times to a fifth of a second and reads average speed on its tachymeter bezel. Calibre 4131 was unveiled in 2023.',
    ),
    specs: { calibre: '4131', movement: AUTO, reserve: 72, water: 100 },
    style: { diameter: 40, indices: 'short', hands: 'baton', pattern: 'lacquer', lugs: 'classic', chrono: 'tri', print: { top: ['CHRONOGRAPH'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.tachy('ceramic', 'Céramique noire', 'Black ceramic', '#0a0a0b'), B.tachy('metal', 'Métal gravé', 'Engraved metal', null)],
    dials: ['white', 'black', 'ice', 'champagne'],
    bracelets: ['oyster', 'rubber-black'],
    metals: ['steel', 'yellow', 'rose', 'white', 'platinum'],
    defaults: { dial: 'white', bezel: 'ceramic', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-datejust-41',
    brand: 'rolex',
    name: 'Datejust 41',
    reference: '126334',
    year: 2017,
    category: 'dress',
    featured: true,
    tagline: T("L'élégance du quotidien", 'Everyday elegance'),
    intro: T(
      "En 1945, la Datejust est la première montre-bracelet automatique étanche à afficher la date dans un guichet. La loupe Cyclope apparaît en 1953.",
      'In 1945 the Datejust was the first self-winding waterproof wristwatch to show the date in a window. The Cyclops lens followed in 1953.',
    ),
    specs: { calibre: '3235', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 41, indices: 'baton', hands: 'dauphine', pattern: 'sunburst', lugs: 'classic', date: true, cyclops: true, print: { top: ['AUTOMATIC'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.fluted, B.smooth],
    dials: ['blue', 'slate', 'green', 'silver', 'black'],
    bracelets: METAL_BR,
    metals: ['steel', 'twotone', 'twotone-rose'],
    defaults: { dial: 'blue', bezel: 'fluted', bracelet: 'jubilee', metal: 'steel' },
  },
  {
    id: 'rolex-day-date-40',
    brand: 'rolex',
    name: 'Day-Date 40',
    reference: '228238',
    year: 2015,
    category: 'dress',
    tagline: T('Le jour en toutes lettres', 'The day spelled out'),
    intro: T(
      "Présentée en 1956, la Day-Date fut la première montre-bracelet à afficher le jour de la semaine en toutes lettres. Elle n'existe qu'en or ou en platine, sur son bracelet trois rangs arrondi.",
      'Introduced in 1956, the Day-Date was the first wristwatch to spell out the day of the week. It exists only in gold or platinum, on its rounded three-piece bracelet.',
    ),
    specs: { calibre: '3255', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 40, indices: 'baton', hands: 'dauphine', pattern: 'sunburst', lugs: 'classic', date: true, cyclops: true, day: true, print: { top: [], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.fluted, B.smooth],
    dials: ['champagne', 'green', 'ice', 'white', 'black'],
    bracelets: ['president'],
    metals: ['yellow', 'rose', 'white', 'platinum'],
    defaults: { dial: 'champagne', bezel: 'fluted', bracelet: 'president', metal: 'yellow' },
  },
  {
    id: 'rolex-explorer',
    brand: 'rolex',
    name: 'Explorer',
    reference: '124270',
    year: 2021,
    category: 'field',
    tagline: T("Née sur l'Everest", 'Born on Everest'),
    intro: T("Inspirée de l'ascension de l'Everest en 1953, l'Explorer privilégie la lisibilité : chiffres 3, 6 et 9 luminescents sur un cadran noir. Retour au diamètre historique de 36 mm.", 'Inspired by the 1953 Everest ascent, the Explorer favours legibility: luminous 3, 6 and 9 numerals on a black dial. A return to the historic 36 mm size.'),
    specs: { calibre: '3230', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 36, indices: 'explorer', hands: 'sword', pattern: 'lacquer', lugs: 'classic', print: { top: ['AUTOMATIC'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.smooth],
    dials: ['black'],
    bracelets: ['oyster'],
    metals: ['steel', 'twotone'],
    defaults: { dial: 'black', bezel: 'smooth', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-explorer-ii',
    brand: 'rolex',
    name: 'Explorer II',
    reference: '226570',
    year: 2021,
    category: 'field',
    tagline: T('Distinguer le jour de la nuit', 'Telling day from night'),
    intro: T("Pensée pour les spéléologues et explorateurs polaires, l'Explorer II indique les 24 heures avec sa grande aiguille orange et sa lunette fixe gravée.", 'Designed for cavers and polar explorers, the Explorer II reads 24 hours with its large orange hand and engraved fixed bezel.'),
    specs: { calibre: '3285', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 42, indices: 'dive', hands: 'sword', pattern: 'matte', lugs: 'classic', crownGuards: true, date: true, cyclops: true, gmt: true, gmtColor: '#e8641d', print: { top: ['24 HOURS'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [{ id: 'steel24', label: T('Acier gravé 24 h', 'Engraved 24 h steel'), style: 'gmt-metal', insert: null }],
    dials: ['white', 'black'],
    bracelets: ['oyster'],
    metals: ['steel'],
    defaults: { dial: 'white', bezel: 'steel24', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-sea-dweller',
    brand: 'rolex',
    name: 'Sea-Dweller',
    reference: '126600',
    year: 2017,
    category: 'diver',
    tagline: T('Étanche à 1 220 mètres', 'Waterproof to 1,220 metres'),
    intro: T("Conçue pour les plongeurs en saturation, la Sea-Dweller résiste à 1 220 m et intègre une valve à hélium. Son boîtier de 43 mm est le plus imposant de la famille Oyster de plongée classique.", 'Built for saturation divers, the Sea-Dweller resists 1,220 m and integrates a helium escape valve. Its 43 mm case is the largest of the classic Oyster divers.'),
    specs: { calibre: '3235', movement: AUTO, reserve: 70, water: 1220 },
    style: { diameter: 43, indices: 'dive', hands: 'sword', pattern: 'lacquer', lugs: 'classic', crownGuards: true, date: true, cyclops: true, print: { top: ['AUTOMATIC'], bottom: ['4000 ft ⁄ 1220 m'] } },
    bezels: [B.dive('black', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['black'],
    bracelets: ['oyster'],
    metals: ['steel', 'twotone'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'rolex-yacht-master-40',
    brand: 'rolex',
    name: 'Yacht-Master 40',
    reference: '126655',
    year: 2015,
    category: 'sport',
    tagline: T('Or rose et caoutchouc', 'Rose gold and rubber'),
    intro: T("Montre de régate raffinée, la Yacht-Master associe un boîtier en or rose, une lunette céramique noire mate aux chiffres en relief et un bracelet en élastomère à âme métallique.", 'A refined regatta watch, the Yacht-Master pairs a rose-gold case, a matte black ceramic bezel with raised numerals and an elastomer strap with a metal core.'),
    specs: { calibre: '3235', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 40, indices: 'dive', hands: 'sword', pattern: 'matte', lugs: 'classic', crownGuards: true, date: true, cyclops: true, print: { top: ['AUTOMATIC'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.dive('matte', 'Céramique noire mate', 'Matte black ceramic', '#151515')],
    dials: ['black', 'slate'],
    bracelets: ['rubber-black', 'oyster'],
    metals: ['rose', 'yellow', 'white'],
    defaults: { dial: 'black', bezel: 'matte', bracelet: 'rubber-black', metal: 'rose' },
  },
  {
    id: 'rolex-oyster-perpetual-41',
    brand: 'rolex',
    name: 'Oyster Perpetual 41',
    reference: '124300',
    year: 2020,
    category: 'dress',
    tagline: T("L'essentiel, en couleurs", 'The essentials, in colour'),
    intro: T("La plus pure des montres Oyster : ni date, ni lunette fonctionnelle, mais des cadrans laqués aux couleurs vives, du turquoise au corail.", 'The purest Oyster watch: no date, no functional bezel, but vividly lacquered dials from turquoise to coral.'),
    specs: { calibre: '3230', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 41, indices: 'baton', hands: 'dauphine', pattern: 'lacquer', lugs: 'classic', print: { top: ['AUTOMATIC'], bottom: ['CHRONOMÈTRE CERTIFIÉ'] } },
    bezels: [B.smooth],
    dials: ['turquoise', 'yellow', 'red', 'green', 'blue', 'silver', 'black'],
    bracelets: ['oyster'],
    metals: ['steel'],
    defaults: { dial: 'turquoise', bezel: 'smooth', bracelet: 'oyster', metal: 'steel' },
  },

  /* ============================== PATEK PHILIPPE ============================== */
  {
    id: 'patek-nautilus-5711',
    brand: 'patek',
    name: 'Nautilus',
    reference: '5711/1A',
    year: 2006,
    category: 'sport',
    featured: true,
    tagline: T('Le hublot devenu légende', 'The porthole turned legend'),
    intro: T(
      "Dessinée par Gérald Genta en 1976, la Nautilus s'inspire des hublots de transatlantiques. La 5711 et son cadran bleu à reliefs horizontaux ont été produits de 2006 à 2021.",
      'Designed by Gérald Genta in 1976, the Nautilus takes its cue from ocean-liner portholes. The 5711, with its horizontally embossed blue dial, was made from 2006 to 2021.',
    ),
    specs: { calibre: '26-330 S C', movement: AUTO, reserve: 45, water: 120 },
    style: { diameter: 40, indices: 'stick', hands: 'baton', pattern: 'horizontal', lugs: 'integrated', date: true, print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.porthole],
    dials: ['blue', 'green', 'white'],
    bracelets: ['integrated'],
    metals: ['steel', 'rose', 'white'],
    defaults: { dial: 'blue', bezel: 'porthole', bracelet: 'integrated', metal: 'steel' },
  },
  {
    id: 'patek-aquanaut-5167',
    brand: 'patek',
    name: 'Aquanaut',
    reference: '5167A',
    year: 2007,
    category: 'sport',
    tagline: T('La cadette décontractée', 'The relaxed younger sister'),
    intro: T("Apparue en 1997, l'Aquanaut reprend la forme octogonale adoucie de la Nautilus avec un cadran gaufré « tropical » assorti à son bracelet composite.", 'Introduced in 1997, the Aquanaut borrows the Nautilus’ softened octagon with an embossed “tropical” dial matching its composite strap.'),
    specs: { calibre: '26-330 S C', movement: AUTO, reserve: 45, water: 120 },
    style: { diameter: 40.8, indices: 'arabic', hands: 'baton', pattern: 'tapisserie', lugs: 'classic', date: true, print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.porthole],
    dials: ['black', 'brown', 'navy'],
    bracelets: ['rubber-black', 'rubber-blue'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'black', bezel: 'porthole', bracelet: 'rubber-black', metal: 'steel' },
  },
  {
    id: 'patek-calatrava-6119',
    brand: 'patek',
    name: 'Calatrava',
    reference: '6119G',
    year: 2021,
    category: 'dress',
    featured: true,
    tagline: T("L'archétype de la montre ronde", 'The archetypal round watch'),
    intro: T(
      "Depuis 1932, la Calatrava incarne la montre habillée selon le Bauhaus. La 6119 reprend la lunette « Clous de Paris » et un calibre à remontage manuel avec petite seconde à 6 h.",
      'Since 1932 the Calatrava has embodied the Bauhaus dress watch. The 6119 revives the hobnail “Clous de Paris” bezel and a hand-wound calibre with small seconds at 6.',
    ),
    specs: { calibre: '30-255 PS', movement: MANUAL, reserve: 65, water: 30 },
    style: { diameter: 39, indices: 'obus', hands: 'dauphine', pattern: 'matte', lugs: 'classic', smallSeconds: true, lume: false, print: { top: [], bottom: ['GENÈVE'] } },
    bezels: [B.coin, B.thin],
    dials: ['slate', 'silver', 'cream'],
    bracelets: LEATHERS,
    metals: ['white', 'rose', 'yellow'],
    defaults: { dial: 'slate', bezel: 'coin', bracelet: 'leather-black', metal: 'white' },
  },
  {
    id: 'patek-5524-travel-time',
    brand: 'patek',
    name: 'Calatrava Pilot Travel Time',
    reference: '5524G',
    year: 2015,
    category: 'pilot',
    tagline: T("L'aviation en or gris", 'Aviation in white gold'),
    intro: T("Hommage aux montres d'aviateur des années 1930, elle affiche deux fuseaux avec deux aiguilles des heures superposées, réglables par poussoirs.", 'A tribute to 1930s aviator watches, it shows two time zones with two superimposed hour hands set by pushers.'),
    specs: { calibre: '324 S C FUS', movement: AUTO, reserve: 45, water: 60 },
    style: { diameter: 42, indices: 'arabic', hands: 'leaf', pattern: 'sunburst', lugs: 'classic', gmt: true, gmtColor: '#d9dde3', date: false, print: { top: [], bottom: ['LOCAL · HOME'] } },
    bezels: [B.thin],
    dials: ['navy', 'brown', 'white'],
    bracelets: ['leather-brown', 'leather-black'],
    metals: ['white', 'rose'],
    defaults: { dial: 'navy', bezel: 'thin', bracelet: 'leather-brown', metal: 'white' },
  },

  /* ============================ AUDEMARS PIGUET ============================ */
  {
    id: 'ap-royal-oak-15510',
    brand: 'ap',
    name: 'Royal Oak Selfwinding',
    reference: '15510ST',
    year: 2022,
    category: 'sport',
    featured: true,
    tagline: T("L'octogone qui a tout changé", 'The octagon that changed everything'),
    intro: T(
      "En 1972, Gérald Genta dessine la première montre de luxe en acier : lunette octogonale à huit vis hexagonales, cadran « Grande Tapisserie » et bracelet intégré.",
      'In 1972 Gérald Genta drew the first steel luxury watch: octagonal bezel with eight hexagonal screws, “Grande Tapisserie” dial and integrated bracelet.',
    ),
    specs: { calibre: '4302', movement: AUTO, reserve: 70, water: 50 },
    style: { diameter: 41, indices: 'stick', hands: 'baton', pattern: 'tapisserie', lugs: 'integrated', date: true, print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.octagon],
    dials: ['blue', 'black', 'green', 'slate'],
    bracelets: ['integrated'],
    metals: ['steel', 'rose', 'yellow', 'titanium'],
    defaults: { dial: 'blue', bezel: 'octagon', bracelet: 'integrated', metal: 'steel' },
  },
  {
    id: 'ap-royal-oak-chrono-26240',
    brand: 'ap',
    name: 'Royal Oak Chronographe',
    reference: '26240ST',
    year: 2022,
    category: 'chrono',
    tagline: T('Tapisserie et compteurs', 'Tapisserie and registers'),
    intro: T("Le chronographe Royal Oak à trois compteurs, animé par le calibre intégré 4401 à roue à colonnes et embrayage vertical.", 'The three-register Royal Oak chronograph, powered by the integrated column-wheel, vertical-clutch calibre 4401.'),
    specs: { calibre: '4401', movement: AUTO, reserve: 70, water: 50 },
    style: { diameter: 41, indices: 'stick', hands: 'baton', pattern: 'tapisserie', lugs: 'integrated', date: true, chrono: 'tri', print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.octagon],
    dials: ['blue', 'black', 'silver'],
    bracelets: ['integrated'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'black', bezel: 'octagon', bracelet: 'integrated', metal: 'steel' },
  },
  {
    id: 'ap-royal-oak-offshore',
    brand: 'ap',
    name: 'Royal Oak Offshore Chronographe',
    reference: '26420SO',
    year: 2021,
    category: 'chrono',
    tagline: T("La « Bête » de 1993", 'The 1993 “Beast”'),
    intro: T("Surnommée « la Bête » à sa sortie en 1993, l'Offshore radicalise la Royal Oak : boîtier massif, poussoirs protégés et cadran « Méga Tapisserie ».", 'Nicknamed “the Beast” at its 1993 launch, the Offshore radicalised the Royal Oak: massive case, protected pushers and “Méga Tapisserie” dial.'),
    specs: { calibre: '4404', movement: AUTO, reserve: 70, water: 100 },
    style: { diameter: 43, indices: 'arabic', hands: 'baton', pattern: 'tapisserie', lugs: 'integrated', crownGuards: true, date: true, chrono: 'tri', print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.octagon],
    dials: ['black', 'blue', 'slate'],
    bracelets: ['rubber-black', 'rubber-blue', 'integrated'],
    metals: ['steel', 'titanium', 'rose'],
    defaults: { dial: 'black', bezel: 'octagon', bracelet: 'rubber-black', metal: 'steel' },
  },

  /* =========================== VACHERON CONSTANTIN =========================== */
  {
    id: 'vc-overseas-4500v',
    brand: 'vc',
    name: 'Overseas',
    reference: '4500V/110A',
    year: 2016,
    category: 'sport',
    tagline: T('La croix de Malte en lunette', 'The Maltese cross as a bezel'),
    intro: T("La lunette à six pans évoque la croix de Malte de la maison. Cadran laqué translucide sur fond soleillé et bracelet interchangeable sans outil.", 'The six-sided bezel echoes the house’s Maltese cross. Translucent lacquer over a sunburst base, tool-free interchangeable strap.'),
    specs: { calibre: '5100', movement: AUTO, reserve: 60, water: 150 },
    style: { diameter: 41, indices: 'stick', hands: 'leaf', pattern: 'sunburst', lugs: 'integrated', date: true, print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [{ id: 'hex', label: T('Six pans', 'Six-sided'), style: 'hexagon' }],
    dials: ['blue', 'silver', 'brown'],
    bracelets: ['integrated', 'leather-blue', 'rubber-blue'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'blue', bezel: 'hex', bracelet: 'integrated', metal: 'steel' },
  },
  {
    id: 'vc-patrimony',
    brand: 'vc',
    name: 'Patrimony',
    reference: '81180/000R',
    year: 2004,
    category: 'dress',
    tagline: T("L'épure absolue", 'Absolute restraint'),
    intro: T("Boîtier ultra-plat, cadran légèrement bombé et index bâtons : la Patrimony incarne le minimalisme de la Haute Horlogerie genevoise.", 'Ultra-thin case, gently domed dial and baton markers: the Patrimony embodies Geneva fine-watchmaking minimalism.'),
    specs: { calibre: '1400', movement: MANUAL, reserve: 40, water: 30 },
    style: { diameter: 40, indices: 'obus', hands: 'dauphine', handColor: 'gold', pattern: 'matte', lugs: 'classic', lume: false, print: { top: [], bottom: ['GENÈVE'] } },
    bezels: [B.thin],
    dials: ['silver', 'cream', 'blue'],
    bracelets: LEATHERS,
    metals: ['rose', 'white'],
    defaults: { dial: 'silver', bezel: 'thin', bracelet: 'leather-brown', metal: 'rose' },
  },

  /* ================================= OMEGA ================================= */
  {
    id: 'omega-speedmaster',
    brand: 'omega',
    name: 'Speedmaster Moonwatch Professional',
    reference: '310.30.42.50.01.001',
    year: 2021,
    category: 'chrono',
    featured: true,
    tagline: T('La première montre portée sur la Lune', 'The first watch worn on the Moon'),
    intro: T(
      "Qualifiée par la NASA en 1965 et portée lors d'Apollo 11, la Speedmaster est un chronographe à remontage manuel. Le calibre 3861 Master Chronometer date de 2021.",
      'Flight-qualified by NASA in 1965 and worn on Apollo 11, the Speedmaster is a hand-wound chronograph. The Master Chronometer calibre 3861 dates from 2021.',
    ),
    specs: { calibre: '3861', movement: MANUAL, reserve: 50, water: 50 },
    style: { diameter: 42, indices: 'short', hands: 'baton', pattern: 'matte', lugs: 'classic', chrono: 'tri', print: { top: ['PROFESSIONAL'], bottom: [] } },
    bezels: [B.tachy('alu', 'Aluminium noir', 'Black aluminium', '#111112'), B.tachy('ceramic', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['black', 'white', 'silver'],
    bracelets: ['oyster', 'leather-black', 'canvas'],
    metals: ['steel', 'yellow', 'white'],
    defaults: { dial: 'black', bezel: 'alu', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'omega-seamaster-300m',
    brand: 'omega',
    name: 'Seamaster Diver 300M',
    reference: '210.30.42.20.03.001',
    year: 2018,
    category: 'diver',
    tagline: T('Les vagues gravées au laser', 'Laser-engraved waves'),
    intro: T("Héritière de la Seamaster de 1993, elle arbore un cadran céramique aux vagues gravées, des aiguilles squelette et une valve à hélium à 10 h.", 'Heir to the 1993 Seamaster, it features a ceramic dial with engraved waves, skeleton hands and a helium valve at 10 o’clock.'),
    specs: { calibre: '8800', movement: AUTO, reserve: 55, water: 300 },
    style: { diameter: 42, indices: 'dive', hands: 'sword', pattern: 'waves', lugs: 'classic', date: true, print: { top: ['ANTIMAGNETIC', 'CHRONOMÈTRE'], bottom: ['300 m ⁄ 1000 ft'] } },
    bezels: [B.dive('blue', 'Céramique bleue', 'Blue ceramic', '#14295a'), B.dive('black', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['blue', 'black', 'white'],
    bracelets: ['oyster', 'rubber-blue', 'rubber-black'],
    metals: ['steel', 'titanium', 'twotone'],
    defaults: { dial: 'blue', bezel: 'blue', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'omega-aqua-terra',
    brand: 'omega',
    name: 'Seamaster Aqua Terra 150M',
    reference: '220.10.41.21.03.004',
    year: 2017,
    category: 'dress',
    tagline: T('Le pont teck des voiliers', 'The teak deck of sailing yachts'),
    intro: T("Son cadran à rainures verticales évoque le pont en teck des voiliers de luxe. Calibre co-axial antimagnétique à 15 000 gauss.", 'Its vertically grooved dial recalls the teak decks of luxury yachts. Co-axial calibre, antimagnetic to 15,000 gauss.'),
    specs: { calibre: '8900', movement: AUTO, reserve: 60, water: 150 },
    style: { diameter: 41, indices: 'obus', hands: 'leaf', pattern: 'horizontal', lugs: 'classic', date: true, print: { top: ['ANTIMAGNETIC', 'CHRONOMÈTRE'], bottom: [] } },
    bezels: [B.thin],
    dials: ['blue', 'slate', 'green', 'silver'],
    bracelets: ['oyster', 'leather-blue', 'rubber-blue'],
    metals: ['steel', 'twotone-rose'],
    defaults: { dial: 'blue', bezel: 'thin', bracelet: 'oyster', metal: 'steel' },
  },

  /* ================================= TUDOR ================================= */
  {
    id: 'tudor-black-bay-58',
    brand: 'tudor',
    name: 'Black Bay Fifty-Eight',
    reference: 'M79030N',
    year: 2018,
    category: 'diver',
    tagline: T("L'esprit 1958 en 39 mm", 'The 1958 spirit at 39 mm'),
    intro: T("Hommage à la première montre de plongée étanche à 200 m de la marque (1958), avec son diamètre compact et ses accents dorés.", 'A tribute to the brand’s first 200 m dive watch (1958), with its compact diameter and gilt accents.'),
    specs: { calibre: 'MT5402', movement: AUTO, reserve: 70, water: 200 },
    style: { diameter: 39, indices: 'dive', hands: 'sword', pattern: 'matte', lugs: 'classic', print: { top: ['AUTOMATIC'], bottom: ['200 m ⁄ 660 ft'] } },
    bezels: [B.dive('black', 'Aluminium noir', 'Black aluminium', '#121212'), B.dive('navy', 'Aluminium bleu', 'Blue aluminium', '#1b2a52'), B.dive('burgundy', 'Aluminium bordeaux', 'Burgundy aluminium', '#4a1520')],
    dials: ['black', 'navy', 'burgundy'],
    bracelets: ['oyster', 'canvas', 'leather-brown'],
    metals: ['steel'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'oyster', metal: 'steel' },
  },
  {
    id: 'tudor-pelagos',
    brand: 'tudor',
    name: 'Pelagos',
    reference: 'M25600TB',
    year: 2015,
    category: 'diver',
    tagline: T('Titane et 500 mètres', 'Titanium and 500 metres'),
    intro: T("Plongeuse professionnelle en titane, étanche à 500 m, avec valve à hélium et boucle à rallonge automatique.", 'A professional titanium diver, waterproof to 500 m, with helium valve and self-adjusting clasp.'),
    specs: { calibre: 'MT5612', movement: AUTO, reserve: 70, water: 500 },
    style: { diameter: 42, indices: 'dive', hands: 'sword', pattern: 'matte', lugs: 'classic', crownGuards: true, date: true, print: { top: ['AUTOMATIC'], bottom: ['500 m ⁄ 1640 ft'] } },
    bezels: [B.dive('blue', 'Céramique bleue', 'Blue ceramic', '#1c3466'), B.dive('black', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['navy', 'black'],
    bracelets: ['oyster', 'rubber-blue', 'rubber-black'],
    metals: ['titanium'],
    defaults: { dial: 'navy', bezel: 'blue', bracelet: 'oyster', metal: 'titanium' },
  },

  /* ================================== IWC ================================== */
  {
    id: 'iwc-pilot-mark-xx',
    brand: 'iwc',
    name: "Pilot's Watch Mark XX",
    reference: 'IW328201',
    year: 2022,
    category: 'pilot',
    tagline: T('La lisibilité du cockpit', 'Cockpit legibility'),
    intro: T("Descendante de la Mark 11 de la Royal Air Force (1948), la Mark XX garde le triangle à 12 h et les grands chiffres arabes, avec 5 jours de réserve de marche.", 'A descendant of the 1948 RAF Mark 11, the Mark XX keeps the triangle at 12 and large Arabic numerals, with a five-day power reserve.'),
    specs: { calibre: '32111', movement: AUTO, reserve: 120, water: 100 },
    style: { diameter: 40, indices: 'arabic', hands: 'sword', pattern: 'matte', lugs: 'classic', date: true, print: { top: ["PILOT'S WATCH"], bottom: ['AUTOMATIC'] } },
    bezels: [B.thin],
    dials: ['black', 'navy', 'green'],
    bracelets: ['leather-brown', 'leather-black', 'oyster'],
    metals: ['steel'],
    defaults: { dial: 'navy', bezel: 'thin', bracelet: 'leather-brown', metal: 'steel' },
  },
  {
    id: 'iwc-portugieser-chrono',
    brand: 'iwc',
    name: 'Portugieser Chronographe',
    reference: 'IW371605',
    year: 2020,
    category: 'chrono',
    tagline: T('Deux compteurs, symétrie parfaite', 'Two registers, perfect symmetry'),
    intro: T("Le chronographe Portugieser à compteurs alignés à 12 h et 6 h, chiffres arabes appliqués et aiguilles feuille. Manufacture depuis 2020 avec le calibre 69355.", 'The Portugieser chronograph with registers aligned at 12 and 6, applied Arabic numerals and leaf hands. In-house since 2020 with calibre 69355.'),
    specs: { calibre: '69355', movement: AUTO, reserve: 46, water: 30 },
    style: { diameter: 41, indices: 'arabic', hands: 'leaf', handColor: 'blued', pattern: 'matte', lugs: 'classic', chrono: 'vertical', lume: false, print: { top: [], bottom: [] } },
    bezels: [B.thin],
    dials: ['silver', 'navy', 'black'],
    bracelets: LEATHERS,
    metals: ['steel', 'rose'],
    defaults: { dial: 'silver', bezel: 'thin', bracelet: 'leather-blue', metal: 'steel' },
  },

  /* =============================== BREITLING =============================== */
  {
    id: 'breitling-navitimer-b01',
    brand: 'breitling',
    name: 'Navitimer B01 Chronographe 43',
    reference: 'AB0138',
    year: 2022,
    category: 'pilot',
    tagline: T('Une règle à calcul au poignet', 'A slide rule on the wrist'),
    intro: T("Depuis 1952, la lunette de la Navitimer est une règle à calcul circulaire : vitesse, consommation, conversion d'unités. Calibre manufacture B01 à roue à colonnes.", 'Since 1952 the Navitimer bezel has been a circular slide rule: speed, fuel, unit conversion. In-house column-wheel calibre B01.'),
    specs: { calibre: 'B01', movement: AUTO, reserve: 70, water: 30 },
    style: { diameter: 43, indices: 'short', hands: 'baton', pattern: 'sunburst', lugs: 'classic', date: true, chrono: 'tri', print: { top: ['CHRONOMETER'], bottom: [] } },
    bezels: [{ id: 'slide', label: T('Règle à calcul', 'Slide rule'), style: 'slide', insert: null }],
    dials: ['black', 'blue', 'green', 'silver'],
    bracelets: ['leather-black', 'leather-brown', 'oyster'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'blue', bezel: 'slide', bracelet: 'leather-black', metal: 'steel' },
  },

  /* ================================= ZENITH ================================= */
  {
    id: 'zenith-chronomaster-sport',
    brand: 'zenith',
    name: 'Chronomaster Sport',
    reference: '03.3100.3600',
    year: 2021,
    category: 'chrono',
    tagline: T('Le dixième de seconde', 'The tenth of a second'),
    intro: T("Le calibre El Primero, premier chronographe automatique à haute fréquence (1969), bat ici à 5 Hz et mesure le dixième de seconde.", 'The El Primero, the first high-frequency automatic chronograph (1969), beats here at 5 Hz and measures tenths of a second.'),
    specs: { calibre: 'El Primero 3600', movement: AUTO, reserve: 60, water: 100 },
    style: { diameter: 41, indices: 'short', hands: 'baton', pattern: 'lacquer', lugs: 'classic', date: true, chrono: 'tri', print: { top: ['HIGH FREQUENCY'], bottom: ['1/10 s'] } },
    bezels: [B.tachy('ceramic', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['white', 'black'],
    bracelets: ['oyster', 'rubber-black'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'white', bezel: 'ceramic', bracelet: 'oyster', metal: 'steel' },
  },

  /* ============================= JAEGER-LECOULTRE ============================= */
  {
    id: 'jlc-master-ultra-thin-moon',
    brand: 'jlc',
    name: 'Master Ultra Thin Moon',
    reference: 'Q1368430',
    year: 2017,
    category: 'dress',
    tagline: T('La Lune au cadran', 'The Moon on the dial'),
    intro: T("Phase de lune d'une précision d'un jour en 3,8 ans, dans un boîtier ultra-plat. Les phases affichées ici suivent la vraie Lune, en temps réel.", 'A moon phase accurate to one day in 3.8 years, in an ultra-thin case. The phases shown here follow the real Moon in real time.'),
    specs: { calibre: '925/1', movement: AUTO, reserve: 70, water: 50 },
    style: { diameter: 39, indices: 'obus', hands: 'dauphine', pattern: 'sunburst', lugs: 'classic', moonphase: true, lume: false, print: { top: [], bottom: [] } },
    bezels: [B.thin],
    dials: ['silver', 'navy'],
    bracelets: LEATHERS,
    metals: ['steel', 'rose'],
    defaults: { dial: 'silver', bezel: 'thin', bracelet: 'leather-brown', metal: 'steel' },
  },

  /* ============================ A. LANGE & SÖHNE ============================ */
  {
    id: 'lange-saxonia-thin',
    brand: 'lange',
    name: 'Saxonia Thin',
    reference: '211.026',
    year: 2015,
    category: 'dress',
    tagline: T('La rigueur saxonne', 'Saxon rigour'),
    intro: T("Mouvement en maillechort non traité, pont trois-quarts et coqs gravés à la main : la Saxonia Thin est l'essence de l'horlogerie de Glashütte.", 'Untreated German-silver movement, three-quarter plate and hand-engraved cocks: the Saxonia Thin is the essence of Glashütte watchmaking.'),
    specs: { calibre: 'L093.1', movement: MANUAL, reserve: 72, water: 30 },
    style: { diameter: 37, indices: 'obus', hands: 'leaf', handColor: 'gold', pattern: 'matte', lugs: 'classic', lume: false, print: { top: [], bottom: ['MADE IN GERMANY'] } },
    bezels: [B.thin],
    dials: ['silver', 'navy', 'cream'],
    bracelets: LEATHERS,
    metals: ['rose', 'white', 'yellow'],
    defaults: { dial: 'silver', bezel: 'thin', bracelet: 'leather-black', metal: 'rose' },
  },

  /* ================================ GRAND SEIKO ================================ */
  {
    id: 'gs-snowflake',
    brand: 'gs',
    name: 'Snowflake',
    reference: 'SBGA211',
    year: 2017,
    category: 'dress',
    featured: true,
    tagline: T('La neige de Shinshu', 'Shinshu snow'),
    intro: T("Son cadran texturé évoque la neige des Alpes japonaises. Le Spring Drive, hybride mécanique/quartz, fait glisser la trotteuse sans à-coups.", 'Its textured dial evokes snow in the Japanese Alps. Spring Drive, a mechanical/quartz hybrid, makes the seconds hand glide without ticks.'),
    specs: { calibre: '9R65', movement: 'springdrive', reserve: 72, water: 100 },
    style: { diameter: 41, indices: 'obus', hands: 'dauphine', handColor: 'blued', pattern: 'grain', lugs: 'classic', date: true, lume: false, print: { top: [], bottom: ['GLIDING SECONDS'] } },
    bezels: [B.thin],
    dials: ['white', 'silver'],
    bracelets: ['oyster', 'leather-black'],
    metals: ['titanium', 'steel'],
    defaults: { dial: 'white', bezel: 'thin', bracelet: 'oyster', metal: 'titanium' },
  },

  /* ================================= BLANCPAIN ================================= */
  {
    id: 'blancpain-fifty-fathoms',
    brand: 'blancpain',
    name: 'Fifty Fathoms',
    reference: '5015-1130-52A',
    year: 2007,
    category: 'diver',
    tagline: T('La toute première montre de plongée moderne', 'The very first modern dive watch'),
    intro: T("Développée en 1953 pour les nageurs de combat français, la Fifty Fathoms a précédé toutes les montres de plongée modernes. Cinq jours de réserve de marche.", 'Developed in 1953 for French combat swimmers, the Fifty Fathoms preceded every modern dive watch. Five-day power reserve.'),
    specs: { calibre: '1315', movement: AUTO, reserve: 120, water: 300 },
    style: { diameter: 45, indices: 'arabic', hands: 'sword', pattern: 'sunburst', lugs: 'classic', date: true, print: { top: ['AUTOMATIC'], bottom: ['300 m ⁄ 1000 ft'] } },
    bezels: [B.dive('black', 'Saphir noir bombé', 'Domed black sapphire', '#0b0b0d'), B.dive('blue', 'Saphir bleu', 'Blue sapphire', '#17305f')],
    dials: ['black', 'blue'],
    bracelets: ['canvas', 'rubber-black', 'oyster'],
    metals: ['steel', 'titanium', 'rose'],
    defaults: { dial: 'black', bezel: 'black', bracelet: 'canvas', metal: 'steel' },
  },

  /* ================================== BREGUET ================================== */
  {
    id: 'breguet-classique-5177',
    brand: 'breguet',
    name: 'Classique',
    reference: '5177BB/29/9V6',
    year: 2010,
    category: 'dress',
    tagline: T("L'héritage d'Abraham-Louis Breguet", 'Abraham-Louis Breguet’s legacy'),
    intro: T("Cadran en émail grand feu, chiffres romains, aiguilles « pomme » en acier bleui et carrure cannelée : tous les codes inventés par Breguet à la fin du XVIIIᵉ siècle.", 'Grand-feu enamel dial, Roman numerals, blued-steel “apple” hands and a fluted caseband: every code Breguet invented in the late 18th century.'),
    specs: { calibre: '777Q', movement: AUTO, reserve: 55, water: 30 },
    style: { diameter: 38, indices: 'roman', hands: 'breguet', handColor: 'blued', pattern: 'enamel', lugs: 'classic', date: true, lume: false, print: { top: [], bottom: [] } },
    bezels: [B.thin],
    dials: ['cream', 'navy'],
    bracelets: LEATHERS,
    metals: ['white', 'rose', 'yellow'],
    defaults: { dial: 'cream', bezel: 'thin', bracelet: 'leather-brown', metal: 'white' },
  },

  /* ================================== CARTIER ================================== */
  {
    id: 'cartier-ballon-bleu',
    brand: 'cartier',
    name: 'Ballon Bleu',
    reference: 'WSBB0040',
    year: 2007,
    category: 'dress',
    tagline: T('La couronne dans sa bulle', 'The crown in its bubble'),
    intro: T("Sa couronne sertie d'un cabochon bleu est protégée par un arc de métal, comme une bulle flottant sur la carrure. Chiffres romains et cadran guilloché.", 'Its blue-cabochon crown is protected by an arc of metal, like a bubble floating on the caseband. Roman numerals and guilloché dial.'),
    specs: { calibre: '1847 MC', movement: AUTO, reserve: 42, water: 30 },
    style: { diameter: 42, indices: 'roman', hands: 'sword', handColor: 'blued', pattern: 'guilloche', lugs: 'classic', crownGuards: true, date: true, lume: false, print: { top: [], bottom: [] } },
    bezels: [B.smooth],
    dials: ['silver', 'navy'],
    bracelets: ['oyster', 'leather-black', 'leather-blue'],
    metals: ['steel', 'yellow', 'rose'],
    defaults: { dial: 'silver', bezel: 'smooth', bracelet: 'oyster', metal: 'steel' },
  },

  /* ================================= TAG HEUER ================================= */
  {
    id: 'tag-carrera-chrono',
    brand: 'tag',
    name: 'Carrera Chronographe',
    reference: 'CBN2A1B',
    year: 2021,
    category: 'chrono',
    tagline: T('Né de la Carrera Panamericana', 'Born of the Carrera Panamericana'),
    intro: T("Jack Heuer crée la Carrera en 1963, en hommage à la course mexicaine la plus dangereuse au monde. Le calibre Heuer 02 offre 80 heures de réserve.", 'Jack Heuer created the Carrera in 1963, named after the world’s most dangerous Mexican road race. The Heuer 02 calibre offers 80 hours of reserve.'),
    specs: { calibre: 'Heuer 02', movement: AUTO, reserve: 80, water: 100 },
    style: { diameter: 42, indices: 'short', hands: 'baton', pattern: 'sunburst', lugs: 'classic', date: true, chrono: 'tri', print: { top: ['AUTOMATIC'], bottom: [] } },
    bezels: [B.tachy('ceramic', 'Céramique noire', 'Black ceramic', '#0a0a0b')],
    dials: ['black', 'blue', 'silver'],
    bracelets: ['oyster', 'leather-black', 'rubber-black'],
    metals: ['steel', 'rose'],
    defaults: { dial: 'black', bezel: 'ceramic', bracelet: 'oyster', metal: 'steel' },
  },
]

export const WATCH_BY_ID: Record<WatchId, WatchDef> = Object.fromEntries(WATCHES.map((w) => [w.id, w]))
export const DEFAULT_WATCH: WatchId = 'rolex-submariner-date'

export const fullName = (w: WatchDef) => `${BRANDS[w.brand].name} ${w.name}`

const MOVEMENT_LABEL: Record<WatchDef['specs']['movement'], Bilingual> = {
  auto: { fr: 'Automatique', en: 'Automatic' },
  manual: { fr: 'Remontage manuel', en: 'Hand-wound' },
  springdrive: { fr: 'Spring Drive', en: 'Spring Drive' },
}

/** Fiche technique normalisée (affichage, comparateur). */
export function specList(w: WatchDef, lang: Lang): { label: string; value: string }[] {
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  return [
    { label: L('Référence', 'Reference'), value: w.reference },
    { label: L('Année', 'Year'), value: String(w.year) },
    { label: L('Diamètre', 'Diameter'), value: `${String(w.style.diameter).replace('.', lang === 'fr' ? ',' : '.')} mm` },
    { label: L('Calibre', 'Calibre'), value: w.specs.calibre },
    { label: L('Mouvement', 'Movement'), value: MOVEMENT_LABEL[w.specs.movement][lang] },
    { label: L('Réserve', 'Reserve'), value: `${w.specs.reserve} h` },
    { label: L('Étanchéité', 'Water res.'), value: `${w.specs.water} m` },
  ]
}

/** Fonctions affichées (comparateur, filtres). */
export function complications(w: WatchDef, lang: Lang): string[] {
  const s = w.style
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const out: string[] = [L('Heures, minutes', 'Hours, minutes')]
  if (!s.chrono && !s.smallSeconds && w.specs.movement !== 'manual') out.push(L('Seconde centrale', 'Centre seconds'))
  if (s.smallSeconds) out.push(L('Petite seconde', 'Small seconds'))
  if (s.date) out.push(L('Date', 'Date'))
  if (s.day) out.push(L('Jour en toutes lettres', 'Day of the week'))
  if (s.chrono) out.push(L('Chronographe', 'Chronograph'))
  if (s.gmt) out.push(L('Second fuseau (GMT)', 'Second time zone (GMT)'))
  if (s.moonphase) out.push(L('Phases de lune', 'Moon phase'))
  return out
}
