import * as THREE from 'three'
import { DIAL_COLORS, type MetalId, type WatchConfig, type WatchDef } from '../data/watches'
import {
  makeBezelTexture,
  makeBrushed,
  makeDateTexture,
  makeDialTexture,
  makeGenevaStripes,
  makePerlage,
  makeRotorTexture,
  makeSunburstAnisotropy,
} from '../lib/textures'
import { DIM } from './dims'

const METAL_COLOR: Record<Exclude<MetalId, 'twotone'>, string> = {
  steel: '#c9ccd1',
  yellow: '#f2c76e',
  rose: '#eab49c',
}

export interface WatchMaterials {
  metal: THREE.MeshPhysicalMaterial
  metalBrushed: THREE.MeshPhysicalMaterial
  accent: THREE.MeshPhysicalMaterial
  accentBrushed: THREE.MeshPhysicalMaterial
  dial: THREE.MeshPhysicalMaterial
  indexMetal: THREE.MeshPhysicalMaterial
  lume: THREE.MeshStandardMaterial
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
let sharedPerlage: THREE.Texture | null = null
let sharedStripes: THREE.Texture | null = null
let sharedRotor: THREE.Texture | null = null

function metalMat(color: string, rough: number, brushed: boolean) {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: rough,
    envMapIntensity: 1.15,
  })
  if (brushed) {
    sharedBrushed ??= makeBrushed()
    m.roughnessMap = sharedBrushed
    m.anisotropy = 0.55
    m.anisotropyRotation = Math.PI / 2
  }
  return m
}

export function createMaterials(watch: WatchDef, cfg: WatchConfig, high: boolean): WatchMaterials {
  const textures: THREE.Texture[] = []
  const mainMetal = cfg.metal === 'twotone' ? 'steel' : cfg.metal
  const accentMetal = cfg.metal === 'twotone' ? 'yellow' : cfg.metal
  const gold = cfg.metal !== 'steel'

  const metal = metalMat(METAL_COLOR[mainMetal], 0.13, false)
  const metalBrushed = metalMat(METAL_COLOR[mainMetal], 0.3, true)
  const accent = metalMat(METAL_COLOR[accentMetal], 0.12, false)
  const accentBrushed = metalMat(METAL_COLOR[accentMetal], 0.3, true)

  const dc = DIAL_COLORS[cfg.dial]
  const dialTex = makeDialTexture({
    base: dc.base,
    print: dc.print,
    sub: watch.id === 'daytona' ? (cfg.dial === 'black' ? '#c9ccd2' : cfg.dial === 'champagne' ? '#121315' : dc.sub) : dc.sub,
    model: watch.id,
    R: DIM.dialR,
    size: high ? 2048 : 1024,
    date: watch.features.date,
  })
  textures.push(dialTex)
  sharedAniso ??= makeSunburstAnisotropy()
  const lacquer = cfg.dial === 'black'
  const dial = new THREE.MeshPhysicalMaterial({
    map: dialTex,
    metalness: lacquer ? 0.05 : 0.55,
    roughness: lacquer ? 0.2 : 0.32,
    clearcoat: lacquer ? 1 : 0.6,
    clearcoatRoughness: 0.06,
    anisotropy: lacquer ? 0 : 0.85,
    anisotropyMap: lacquer ? null : sharedAniso,
    envMapIntensity: 1,
  })

  const indexColor = gold ? METAL_COLOR[accentMetal] : '#eceef1'
  const indexMetal = new THREE.MeshPhysicalMaterial({ color: indexColor, metalness: 1, roughness: 0.07, envMapIntensity: 1.4 })
  const lume = new THREE.MeshStandardMaterial({
    color: '#eef1e6',
    roughness: 0.55,
    emissive: '#7fe0c2',
    emissiveIntensity: 0.18,
  })

  const bezelOpt = watch.bezels.find((b) => b.id === cfg.bezel) ?? watch.bezels[0]
  let ceramic: THREE.MeshPhysicalMaterial | null = null
  if (bezelOpt.style === 'dive' || bezelOpt.style === 'tachy') {
    const isCeramic = !!bezelOpt.insert
    const tex = makeBezelTexture({
      style: bezelOpt.style,
      base: isCeramic ? bezelOpt.insert! : METAL_COLOR[accentMetal],
      print: isCeramic ? (gold ? '#e9c77a' : '#dfe3e8') : '#1a1a1c',
      R: DIM.bezelR,
      rIn: DIM.insertRin,
      size: high ? 2048 : 1024,
    })
    textures.push(tex)
    ceramic = new THREE.MeshPhysicalMaterial({
      map: tex,
      metalness: isCeramic ? 0 : 1,
      roughness: isCeramic ? 0.12 : 0.28,
      clearcoat: isCeramic ? 1 : 0,
      clearcoatRoughness: 0.04,
      envMapIntensity: isCeramic ? 1.3 : 1,
    })
  }

  const crystal = high
    ? new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.02,
        transmission: 1,
        thickness: 1.2,
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
        opacity: 0.06,
        envMapIntensity: 0.7,
        depthWrite: false,
      })

  const day = new Date().getDate()
  const dateTex = makeDateTexture(day, DIM.dateR, high ? 1024 : 512)
  textures.push(dateTex)
  const dateDisc = new THREE.MeshStandardMaterial({ map: dateTex, roughness: 0.45 })

  const dark = new THREE.MeshStandardMaterial({ color: '#0a0a0b', roughness: 0.6, metalness: 0.2 })

  sharedPerlage ??= makePerlage()
  sharedStripes ??= makeGenevaStripes()
  const plateTex = sharedPerlage.clone()
  plateTex.repeat.set(1 / 9, 1 / 9)
  plateTex.offset.set(0.5, 0.5)
  const stripeTex = sharedStripes.clone()
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
    sharedRotor = makeRotorTexture(DIM.movementR)
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

  const all = [metal, metalBrushed, accent, accentBrushed, dial, indexMetal, lume, crystal, dateDisc, dark, plate, bridge, gilt, steelPart, blued, ruby, rotor]
  if (ceramic) all.push(ceramic)
  return {
    metal,
    metalBrushed,
    accent,
    accentBrushed,
    dial,
    indexMetal,
    lume,
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
