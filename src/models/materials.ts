import * as THREE from 'three'
import { DIAL_COLORS, BRACELETS, type MetalId, type WatchConfig, type WatchDef } from '../data/watches'
import type { Lang } from '../data/parts'
import {
  makeBezelTexture,
  makeBrushed,
  makeDateTexture,
  makeDayTexture,
  makeDialBump,
  makeDialTexture,
  makeGenevaStripes,
  makeMoonTexture,
  makePerlage,
  makeRotorTexture,
  makeStrapGrain,
  makeSunburstAnisotropy,
  deferredTexture,
  type InsertStyle,
} from '../lib/textures'
import { enqueue } from '../lib/scheduler'
import { DIM } from './dims'
import { dialLayout } from './dialLayout'

type BaseMetal = Exclude<MetalId, 'twotone' | 'twotone-rose'>
export const METAL_COLOR: Record<BaseMetal, string> = {
  steel: '#c9ccd1',
  titanium: '#a9adb3',
  yellow: '#f2c76e',
  rose: '#eab49c',
  white: '#dfe1e4',
  platinum: '#e2e4e8',
}
const METAL_ROUGH: Record<BaseMetal, number> = { steel: 0.13, titanium: 0.3, yellow: 0.12, rose: 0.12, white: 0.1, platinum: 0.1 }

const STRAP_COLOR: Record<string, string> = {
  'leather-brown': '#4a2a17',
  'leather-black': '#121112',
  'leather-blue': '#14213f',
  'rubber-black': '#141415',
  'rubber-blue': '#1a2c57',
  canvas: '#2d3136',
}

export interface WatchMaterials {
  metal: THREE.MeshPhysicalMaterial
  metalBrushed: THREE.MeshPhysicalMaterial
  accent: THREE.MeshPhysicalMaterial
  accentBrushed: THREE.MeshPhysicalMaterial
  dial: THREE.MeshPhysicalMaterial
  indexMetal: THREE.MeshPhysicalMaterial
  lume: THREE.MeshStandardMaterial
  /** Aiguilles (acier poli, acier bleui ou or selon le modèle). */
  hand: THREE.MeshPhysicalMaterial
  gmtHand: THREE.MeshPhysicalMaterial
  strap: THREE.MeshPhysicalMaterial | null
  stitch: THREE.MeshStandardMaterial
  dayDisc: THREE.MeshStandardMaterial
  moon: THREE.MeshPhysicalMaterial
  ceramic: THREE.MeshPhysicalMaterial | null
  crystal: THREE.MeshPhysicalMaterial
  dateDisc: THREE.MeshStandardMaterial
  dark: THREE.MeshStandardMaterial
  plate: THREE.MeshPhysicalMaterial
  bridge: THREE.MeshPhysicalMaterial
  gilt: THREE.MeshPhysicalMaterial
  steelPart: THREE.MeshPhysicalMaterial
  blued: THREE.MeshPhysicalMaterial
  ruby: THREE.MeshPhysicalMaterial
  rotor: THREE.MeshPhysicalMaterial
  all: THREE.Material[]
  textures: THREE.Texture[]
}

let sharedAniso: THREE.DataTexture | null = null
let sharedBrushed: THREE.Texture | null = null
let sharedPerlage: ReturnType<typeof deferredTexture> | null = null
let sharedStripes: ReturnType<typeof deferredTexture> | null = null
let sharedRotor: THREE.Texture | null = null

function metalMat(color: string, rough: number, brushed: boolean) {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: rough,
    envMapIntensity: 1.15,
  })
  if (brushed) {
    if (!sharedBrushed) {
      const d = deferredTexture(makeBrushed, { srgb: false, repeat: true })
      sharedBrushed = d.tex
      enqueue(d.job)
    }
    m.roughnessMap = sharedBrushed
    m.anisotropy = 0.55
    m.anisotropyRotation = Math.PI / 2
  }
  return m
}

export function createMaterials(watch: WatchDef, cfg: WatchConfig, high: boolean, lang: Lang = 'fr'): WatchMaterials {
  const textures: THREE.Texture[] = []
  const twotone = cfg.metal === 'twotone' || cfg.metal === 'twotone-rose'
  const mainMetal: BaseMetal = twotone ? 'steel' : (cfg.metal as BaseMetal)
  const accentMetal: BaseMetal = cfg.metal === 'twotone' ? 'yellow' : cfg.metal === 'twotone-rose' ? 'rose' : (cfg.metal as BaseMetal)
  const gold = ['yellow', 'rose', 'twotone', 'twotone-rose'].includes(cfg.metal)
  const style = watch.style
  const layout = dialLayout(style)

  const metal = metalMat(METAL_COLOR[mainMetal], METAL_ROUGH[mainMetal], false)
  const metalBrushed = metalMat(METAL_COLOR[mainMetal], Math.max(0.3, METAL_ROUGH[mainMetal] + 0.12), true)
  const accent = metalMat(METAL_COLOR[accentMetal], METAL_ROUGH[accentMetal], false)
  const accentBrushed = metalMat(METAL_COLOR[accentMetal], 0.3, true)

  const dc = DIAL_COLORS[cfg.dial]
  const lumeColor = '#eef1e6'
  // Textures dessinées en différé (une par tranche de temps), placeholders immédiats
  const dialD = deferredTexture(
    () =>
      makeDialTexture({
        base: dc.base,
        print: dc.print,
        sub: style.chrono === 'tri' && cfg.dial === 'white' ? '#141518' : style.chrono === 'tri' && cfg.dial === 'black' ? '#c9ccd2' : dc.sub,
        lume: lumeColor,
        R: DIM.dialR,
        size: high ? 2048 : 1024,
        style,
        layout,
      }),
    { color: dc.base },
  )
  const dialTex = dialD.tex
  enqueue(dialD.job, true)
  textures.push(dialTex)
  sharedAniso ??= makeSunburstAnisotropy()
  const p = style.pattern
  const glossy = p === 'lacquer' || p === 'enamel'
  const sunburst = p === 'sunburst'
  let bump: THREE.Texture | null = null
  if (['tapisserie', 'horizontal', 'waves', 'guilloche', 'grain'].includes(p)) {
    const bd = deferredTexture(() => makeDialBump(p, DIM.dialR, high ? 1024 : 512), { srgb: false })
    bump = bd.tex
    enqueue(bd.job)
    textures.push(bump)
  }
  const dial = new THREE.MeshPhysicalMaterial({
    map: dialTex,
    metalness: glossy ? 0.05 : sunburst ? 0.55 : p === 'matte' ? 0.15 : 0.35,
    roughness: glossy ? 0.18 : sunburst ? 0.32 : p === 'matte' ? 0.6 : 0.42,
    clearcoat: glossy ? 1 : sunburst ? 0.6 : 0.2,
    clearcoatRoughness: 0.06,
    anisotropy: sunburst ? 0.85 : 0,
    anisotropyMap: sunburst ? sharedAniso : null,
    bumpMap: bump,
    bumpScale: bump ? 0.9 : 1,
    envMapIntensity: 1,
  })

  const indexColor = gold ? METAL_COLOR[accentMetal] : '#eceef1'
  const indexMetal = new THREE.MeshPhysicalMaterial({ color: indexColor, metalness: 1, roughness: 0.07, envMapIntensity: 1.4 })
  const lume = new THREE.MeshStandardMaterial({
    color: lumeColor,
    roughness: 0.55,
    emissive: '#7fe0c2',
    emissiveIntensity: 0.18,
  })
  const hc = style.handColor ?? 'metal'
  const hand =
    hc === 'blued'
      ? new THREE.MeshPhysicalMaterial({ color: '#2349b8', metalness: 0.75, roughness: 0.2, emissive: '#06123a', emissiveIntensity: 0.25 })
      : hc === 'gold'
        ? new THREE.MeshPhysicalMaterial({ color: METAL_COLOR[gold ? accentMetal : 'yellow'], metalness: 1, roughness: 0.08, envMapIntensity: 1.4 })
        : indexMetal
  const gmtHand = new THREE.MeshPhysicalMaterial({ color: style.gmtColor ?? '#c8322a', metalness: 0.2, roughness: 0.3, clearcoat: 1 })

  const bezelOpt = watch.bezels.find((b) => b.id === cfg.bezel) ?? watch.bezels[0]
  let ceramic: THREE.MeshPhysicalMaterial | null = null
  const insertStyles: InsertStyle[] = ['dive', 'tachy', 'gmt', 'gmt-metal', 'slide']
  if (insertStyles.includes(bezelOpt.style as InsertStyle)) {
    const isCeramic = !!bezelOpt.insert
    const base = isCeramic ? bezelOpt.insert! : bezelOpt.style === 'slide' ? '#141517' : METAL_COLOR[accentMetal]
    const bezelD = deferredTexture(
      () =>
        makeBezelTexture({
          style: bezelOpt.style as InsertStyle,
          base,
          base2: bezelOpt.insert2,
          print: isCeramic || bezelOpt.style === 'slide' ? (gold ? '#e9c77a' : '#dfe3e8') : '#1a1a1c',
          R: DIM.bezelR,
          rIn: DIM.insertRin,
          size: high ? 2048 : 1024,
        }),
      { color: base },
    )
    const tex = bezelD.tex
    enqueue(bezelD.job)
    textures.push(tex)
    const shiny = isCeramic || bezelOpt.style === 'slide'
    ceramic = new THREE.MeshPhysicalMaterial({
      map: tex,
      metalness: shiny ? 0 : 1,
      roughness: shiny ? 0.12 : 0.28,
      clearcoat: shiny ? 1 : 0,
      clearcoatRoughness: 0.04,
      envMapIntensity: shiny ? 1.3 : 1,
    })
  }

  // Bracelet souple (cuir, caoutchouc, toile)
  let strap: THREE.MeshPhysicalMaterial | null = null
  if (BRACELETS[cfg.bracelet].kind === 'strap') {
    const kind = cfg.bracelet.startsWith('leather') ? 'leather' : cfg.bracelet === 'canvas' ? 'canvas' : 'rubber'
    const gd = deferredTexture(() => makeStrapGrain(kind), { srgb: false, repeat: true })
    gd.tex.repeat.set(1 / 14, 1 / 14)
    enqueue(gd.job)
    textures.push(gd.tex)
    strap = new THREE.MeshPhysicalMaterial({
      color: STRAP_COLOR[cfg.bracelet] ?? '#222',
      roughness: kind === 'leather' ? 0.42 : kind === 'rubber' ? 0.7 : 0.85,
      metalness: 0,
      clearcoat: kind === 'leather' ? 0.5 : 0,
      clearcoatRoughness: 0.35,
      sheen: kind === 'canvas' ? 0.6 : 0,
      bumpMap: gd.tex,
      bumpScale: kind === 'leather' ? 1.2 : 0.6,
    })
  }
  const stitch = new THREE.MeshStandardMaterial({ color: cfg.bracelet === 'leather-black' ? '#2a2a2a' : '#e9dcc3', roughness: 0.8 })

  const crystal = high
    ? new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 0.6,
        ior: 1.77,
        specularIntensity: 1,
        envMapIntensity: 1.2,
        attenuationColor: new THREE.Color('#f2f6ff'),
        attenuationDistance: 40,
        transparent: false,
      })
    : new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.02,
        transparent: true,
        opacity: 0.05,
        envMapIntensity: 0.35,
        depthWrite: false,
      })

  const now = new Date()
  const day = now.getDate()
  const dateD = deferredTexture(() => makeDateTexture(day, DIM.dateR, high ? 1024 : 512, layout.date?.angle ?? 0, layout.date?.r ?? 11.8), { color: '#f4f2ec' })
  const dateTex = dateD.tex
  enqueue(dateD.job)
  textures.push(dateTex)
  const dateDisc = new THREE.MeshStandardMaterial({ map: dateTex, roughness: 0.45 })

  const names = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long' }))
  const dayD = deferredTexture(() => makeDayTexture(names, now.getDay(), DIM.dateR, high ? 1024 : 512), { color: '#f4f2ec' })
  enqueue(dayD.job)
  textures.push(dayD.tex)
  const dayDisc = new THREE.MeshStandardMaterial({ map: dayD.tex, roughness: 0.45 })
  const moonD = deferredTexture(() => makeMoonTexture(6, 3.6, high ? 1024 : 512), { color: '#13214a' })
  enqueue(moonD.job)
  textures.push(moonD.tex)
  const moon = new THREE.MeshPhysicalMaterial({ map: moonD.tex, metalness: 0.3, roughness: 0.35, clearcoat: 0.6 })

  const dark = new THREE.MeshStandardMaterial({ color: '#0a0a0b', roughness: 0.6, metalness: 0.2 })

  if (!sharedPerlage) {
    sharedPerlage = deferredTexture(makePerlage, { srgb: false, repeat: true })
    enqueue(sharedPerlage.job)
  }
  if (!sharedStripes) {
    sharedStripes = deferredTexture(makeGenevaStripes, { srgb: false, repeat: true })
    enqueue(sharedStripes.job)
  }
  const plateTex = sharedPerlage.derive()
  plateTex.repeat.set(1 / 9, 1 / 9)
  plateTex.offset.set(0.5, 0.5)
  const stripeTex = sharedStripes.derive()
  stripeTex.repeat.set(1 / 24, 1 / 24)
  textures.push(plateTex, stripeTex)
  const plate = new THREE.MeshPhysicalMaterial({
    color: '#d4d7db',
    metalness: 0.85,
    roughness: 0.38,
    bumpMap: plateTex,
    bumpScale: 0.12,
    roughnessMap: plateTex,
  })
  const bridge = new THREE.MeshPhysicalMaterial({
    color: '#dfe2e6',
    metalness: 0.9,
    roughness: 0.26,
    bumpMap: stripeTex,
    bumpScale: 0.1,
    roughnessMap: stripeTex,
  })
  const gilt = new THREE.MeshPhysicalMaterial({ color: '#e9c47a', metalness: 1, roughness: 0.22 })
  const steelPart = new THREE.MeshPhysicalMaterial({ color: '#c3c6cc', metalness: 1, roughness: 0.12 })
  const blued = new THREE.MeshPhysicalMaterial({ color: '#2b55d6', metalness: 0.7, roughness: 0.25, emissive: '#06123a', emissiveIntensity: 0.3 })
  const ruby = new THREE.MeshPhysicalMaterial({
    color: '#c0102c',
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    emissive: '#4a0010',
    emissiveIntensity: 0.6,
    specularIntensity: 1,
    ior: 1.77,
  })
  if (!sharedRotor) {
    const d = deferredTexture(() => makeRotorTexture(DIM.movementR), { color: '#b9bcc2' })
    sharedRotor = d.tex
    enqueue(d.job)
    // UV en mm ; miroir horizontal car la face visible du rotor est côté fond (z négatif)
    sharedRotor.repeat.set(-1 / (2 * DIM.movementR), 1 / (2 * DIM.movementR))
    sharedRotor.offset.set(0.5, 0.5)
  }
  const rotor = new THREE.MeshPhysicalMaterial({
    map: sharedRotor,
    color: gold ? '#f0cf8a' : '#ffffff',
    metalness: 1,
    roughness: 0.26,
  })

  const all: THREE.Material[] = [metal, metalBrushed, accent, accentBrushed, dial, indexMetal, lume, gmtHand, stitch, dayDisc, moon, crystal, dateDisc, dark, plate, bridge, gilt, steelPart, blued, ruby, rotor]
  if (hand !== indexMetal) all.push(hand)
  if (ceramic) all.push(ceramic)
  if (strap) all.push(strap)
  return {
    metal,
    metalBrushed,
    accent,
    accentBrushed,
    dial,
    indexMetal,
    lume,
    hand,
    gmtHand,
    strap,
    stitch,
    dayDisc,
    moon,
    ceramic,
    crystal,
    dateDisc,
    dark,
    plate,
    bridge,
    gilt,
    steelPart,
    blued,
    ruby,
    rotor,
    all,
    textures,
  }
}

export function disposeMaterials(m: WatchMaterials) {
  m.all.forEach((x) => x.dispose())
  m.textures.forEach((t) => t.dispose())
}
