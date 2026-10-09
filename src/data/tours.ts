import type { Bilingual } from './parts'

export type TourView = 'back' | 'front' | 'three4'

export interface TourStep {
  /** Pièces mises en avant (la première sert de référence pour les textes de montage). */
  parts: string[]
  view: TourView
  title?: Bilingual
  text?: Bilingual
  /** Ralentir l'échappement pendant l'étape. */
  slow?: boolean
}

const T = (fr: string, en: string): Bilingual => ({ fr, en })

/**
 * Montage pas à pas : l'ordre suit celui d'un horloger (mouvement, cadran, aiguilles,
 * emboîtage, habillage). Les étapes sans pièce présente sur la montre sont ignorées.
 */
export const ASSEMBLY: TourStep[] = [
  { parts: ['mainplate'], view: 'back', title: T('La platine', 'The main plate') },
  { parts: ['barrel'], view: 'back', title: T('Le barillet', 'The barrel') },
  { parts: ['centerWheel'], view: 'back', title: T('La roue de centre', 'The centre wheel') },
  { parts: ['thirdWheel', 'fourthWheel'], view: 'back', title: T('Roue moyenne et roue de secondes', 'Third and fourth wheels') },
  { parts: ['bridges', 'jewels'], view: 'back', title: T('Les ponts et leurs rubis', 'Bridges and jewels') },
  { parts: ['escapeWheel', 'palletFork'], view: 'back', title: T("L'échappement", 'The escapement') },
  { parts: ['balanceWheel', 'hairspring'], view: 'back', title: T('Le balancier-spiral', 'The balance and hairspring') },
  { parts: ['balanceBridge'], view: 'back', title: T('Le pont de balancier', 'The balance bridge') },
  { parts: ['rotor'], view: 'back', title: T('La masse oscillante', 'The oscillating rotor') },
  { parts: ['dateWheel', 'dayWheel', 'moonphase'], view: 'front', title: T('Les affichages sous le cadran', 'Under-dial displays') },
  { parts: ['dial', 'indices'], view: 'front', title: T('Le cadran', 'The dial') },
  { parts: ['hourHand', 'gmtHand'], view: 'front', title: T('Aiguille des heures', 'Hour hand') },
  { parts: ['minuteHand'], view: 'front', title: T('Aiguille des minutes', 'Minute hand') },
  { parts: ['secondsHand', 'subdialHands'], view: 'front', title: T('Trotteuse et compteurs', 'Seconds and sub-dial hands') },
  { parts: ['case', 'pushers'], view: 'three4', title: T("L'emboîtage", 'Casing') },
  { parts: ['bezel', 'bezelInsert', 'crystal', 'cyclops'], view: 'three4', title: T('Lunette et verre', 'Bezel and crystal') },
  { parts: ['caseback'], view: 'back', title: T('Le fond de boîte', 'The case back') },
  { parts: ['crown'], view: 'three4', title: T('La couronne', 'The crown') },
  { parts: ['bracelet', 'clasp'], view: 'three4', title: T('Le bracelet', 'The bracelet') },
]

/** Le trajet de l'énergie, du poignet jusqu'aux aiguilles. */
export const ENERGY: TourStep[] = [
  {
    parts: ['rotor'],
    view: 'back',
    title: T("1 · L'énergie vient du poignet", '1 · Energy comes from the wrist'),
    text: T(
      "Chaque mouvement du bras fait pivoter la masse oscillante. Par un jeu de roues d'inversion, ses rotations — dans un sens comme dans l'autre — arment le ressort moteur. Quelques heures au poignet suffisent à remplir la réserve.",
      'Every arm movement swings the oscillating rotor. Through reversing wheels, its rotation — in either direction — winds the mainspring. A few hours on the wrist fill the reserve.',
    ),
  },
  {
    parts: ['barrel'],
    view: 'back',
    title: T('2 · Le ressort stocke la force', '2 · The spring stores the force'),
    text: T(
      "Le ressort moteur, une lame d'acier spéciale de près de 50 cm, est enroulé dans le barillet. En se détendant lentement — pendant 2 à 5 jours selon les calibres — il fait tourner le tambour denté.",
      'The mainspring, a special steel strip nearly 50 cm long, is coiled in the barrel. As it slowly unwinds — for 2 to 5 days depending on the calibre — it turns the toothed drum.',
    ),
  },
  {
    parts: ['centerWheel', 'thirdWheel', 'fourthWheel'],
    view: 'back',
    title: T('3 · Le rouage démultiplie', '3 · The gear train steps up'),
    text: T(
      "Roue de centre (1 tour par heure), roue moyenne, roue de secondes (1 tour par minute) : à chaque engrenage roue-pignon, la vitesse est multipliée par 7 à 8, et la force divisée d'autant.",
      'Centre wheel (1 turn per hour), third wheel, fourth wheel (1 turn per minute): at each wheel-pinion mesh, speed is multiplied by 7 to 8 and force divided as much.',
    ),
  },
  {
    parts: ['escapeWheel', 'palletFork'],
    view: 'back',
    slow: true,
    title: T("4 · L'échappement libère par paquets", '4 · The escapement releases in bursts'),
    text: T(
      "Sans frein, le rouage se déchargerait en quelques secondes. L'ancre bloque la roue d'échappement puis la libère d'une demi-dent à chaque alternance du balancier, en lui rendant au passage une petite impulsion. Regardez au ralenti.",
      'Unchecked, the train would run down in seconds. The pallet fork locks the escape wheel and releases it half a tooth per balance swing, giving the balance a small impulse each time. Watch it in slow motion.',
    ),
  },
  {
    parts: ['balanceWheel', 'hairspring'],
    view: 'back',
    slow: true,
    title: T('5 · Le balancier bat la mesure', '5 · The balance keeps the beat'),
    text: T(
      "Le balancier et son spiral forment un oscillateur, comme un pendule de poche : 4 allers-retours par seconde (28 800 alternances par heure). Leur régularité fait toute la précision de la montre — quelques secondes par jour.",
      'The balance and hairspring form an oscillator, like a pocket pendulum: 4 back-and-forths per second (28,800 vibrations per hour). Their regularity is the watch’s whole accuracy — a few seconds a day.',
    ),
  },
  {
    parts: ['centerWheel', 'hourHand', 'minuteHand', 'secondsHand'],
    view: 'front',
    title: T("6 · Retour aux aiguilles", '6 · Back to the hands'),
    text: T(
      "La roue de centre porte la chaussée et l'aiguille des minutes ; la minuterie divise par 12 pour l'aiguille des heures ; la roue de secondes porte la trotteuse. L'énergie du poignet s'achève en temps lisible.",
      'The centre wheel carries the cannon pinion and minute hand; the motion works divide by 12 for the hour hand; the fourth wheel carries the seconds hand. The wrist’s energy ends as readable time.',
    ),
  },
]

export const TOURS = { assembly: ASSEMBLY, energy: ENERGY }

/** Étapes réellement applicables (pièces présentes sur la montre affichée). */
export function resolveSteps(steps: TourStep[], present: Set<string>): TourStep[] {
  return steps.map((s) => ({ ...s, parts: s.parts.filter((p) => present.has(p)) })).filter((s) => s.parts.length > 0)
}
