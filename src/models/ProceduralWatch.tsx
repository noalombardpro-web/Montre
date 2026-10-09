import { useEffect, useMemo, useState } from 'react'
import { useAtelier } from '../store/useAtelier'
import { Part } from '../components/three/Part'
import { ExplodeLines } from '../components/three/ExplodeLines'
import { WATCH_BY_ID, type WatchConfig, type WatchId } from '../data/watches'
import { createMaterials, disposeMaterials } from './materials'
import { Caseback, CaseMiddle, Crown, Pushers } from './procedural/CaseParts'
import { Bezel, BezelInsert, Crystal, Cyclops } from './procedural/BezelParts'
import { DateWheel, DayWheel, Dial, GmtHand, HourHand, Indices, MinuteHand, MoonDisc, SecondsHand, SubdialHands } from './procedural/DialParts'
import { dialLayout } from './dialLayout'
import { partsFor } from '../data/parts'
import { EnergyFlow } from '../components/three/EnergyFlow'
import {
  BalanceBridge,
  BalanceWheel,
  Barrel,
  Bridges,
  CenterWheel,
  EscapeWheel,
  FourthWheel,
  Hairspring,
  Jewels,
  MainPlate,
  PalletFork,
  Rotor,
  ThirdWheel,
} from './procedural/MovementParts'
import { Bracelet, Clasp } from './procedural/Bracelet'

/**
 * Montage progressif : un groupe de pièces par étape, une étape toutes les deux frames.
 * Chaque étape (géométries + compilation des shaders) tient ainsi dans une tâche courte.
 */
const STAGES = 8
function useStages() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    useAtelier.getState().set({ staged: false })
  }, [])
  useEffect(() => {
    if (stage >= STAGES) {
      useAtelier.getState().set({ staged: true })
      return
    }
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setStage((s) => s + 1))
    })
    return () => cancelAnimationFrame(raf)
  }, [stage])
  return stage
}

const STAGE_OF: Record<string, number> = {
  case: 0, crown: 0, pushers: 0, bezel: 0, bezelInsert: 0,
  dial: 1, indices: 1, dateWheel: 1, dayWheel: 1, moonphase: 1, hourHand: 1, minuteHand: 1, secondsHand: 1, subdialHands: 1, gmtHand: 1,
  crystal: 2, cyclops: 2,
  bracelet: 3,
  clasp: 4, caseback: 4,
  mainplate: 5, barrel: 5, centerWheel: 5, thirdWheel: 5, fourthWheel: 5,
  escapeWheel: 6, palletFork: 6, balanceWheel: 6, hairspring: 6, jewels: 6,
  bridges: 7, balanceBridge: 7, rotor: 7,
}

/**
 * Montre générée entièrement par le code (aucun asset externe) à partir de son
 * descripteur de style : chaque pièce est un nœud nommé selon parts.json.
 */
export function ProceduralWatch({ id, config, high }: { id: WatchId; config: WatchConfig; high: boolean }) {
  const watch = WATCH_BY_ID[id]
  const lang = useAtelier((s) => s.lang)
  const wrist = useAtelier((s) => s.wrist)
  const night = useAtelier((s) => s.night)
  const m = useMemo(() => createMaterials(watch, config, high, lang), [watch, config, high, lang])
  useEffect(() => () => disposeMaterials(m), [m])
  // Mode nuit : la luminescence se révèle (le bloom la fait rayonner)
  useEffect(() => {
    m.lume.emissiveIntensity = night ? 2.6 : 0.18
    m.lume.color.set(night ? '#a9f5d9' : '#eef1e6')
  }, [m, night])
  const style = watch.style
  const layout = useMemo(() => dialLayout(style), [style])
  const bezel = watch.bezels.find((b) => b.id === config.bezel) ?? watch.bezels[0]
  const twoTone = config.metal === 'twotone' || config.metal === 'twotone-rose'
  const stage = useStages()
  const present = useMemo(() => new Set(partsFor(watch, config).map((p) => p.id)), [watch, config])
  const show = (pid: string) => present.has(pid) && stage > (STAGE_OF[pid] ?? 0)
  const glide = watch.specs.movement === 'springdrive'
  const scale = style.diameter / 40

  return (
    <group name={`watch-${id}`} scale={scale}>
      {show('case') && (
        <Part id="case">
          <CaseMiddle m={m} guards={!!style.crownGuards} integrated={style.lugs === 'integrated'} />
        </Part>
      )}
      {show('crown') && (
        <Part id="crown">
          <Crown m={m} />
        </Part>
      )}
      {show('pushers') && (
        <Part id="pushers">
          <Pushers m={m} />
        </Part>
      )}
      {show('bezel') && (
        <Part id="bezel">
          <Bezel m={m} option={bezel} accent={twoTone} />
        </Part>
      )}
      {show('bezelInsert') && (
        <Part id="bezelInsert">
          <BezelInsert m={m} style={bezel.style} />
        </Part>
      )}
      {show('crystal') && (
        <Part id="crystal">
          <Crystal m={m} />
        </Part>
      )}
      {show('cyclops') && (
        <Part id="cyclops">
          <Cyclops m={m} angle={layout.date?.angle} r={layout.date?.r} />
        </Part>
      )}
      {show('dial') && (
        <Part id="dial">
          <Dial m={m} layout={layout} />
        </Part>
      )}
      {show('indices') && (
        <Part id="indices">
          <Indices m={m} style={style} layout={layout} />
        </Part>
      )}
      {show('dateWheel') && (
        <Part id="dateWheel">
          <DateWheel m={m} />
        </Part>
      )}
      {show('dayWheel') && (
        <Part id="dayWheel">
          <DayWheel m={m} />
        </Part>
      )}
      {show('moonphase') && (
        <Part id="moonphase">
          <MoonDisc m={m} layout={layout} />
        </Part>
      )}
      {show('hourHand') && (
        <Part id="hourHand">
          <HourHand m={m} style={style} />
        </Part>
      )}
      {show('gmtHand') && (
        <Part id="gmtHand">
          <GmtHand m={m} />
        </Part>
      )}
      {show('minuteHand') && (
        <Part id="minuteHand">
          <MinuteHand m={m} style={style} />
        </Part>
      )}
      {show('secondsHand') && (
        <Part id="secondsHand">
          <SecondsHand m={m} style={style} glide={glide} />
        </Part>
      )}
      {show('subdialHands') && (
        <Part id="subdialHands">
          <SubdialHands m={m} layout={layout} glide={glide} />
        </Part>
      )}

      {show('mainplate') && (
        <Part id="mainplate">
          <MainPlate m={m} />
        </Part>
      )}
      {show('barrel') && (
        <Part id="barrel">
          <Barrel m={m} />
        </Part>
      )}
      {show('centerWheel') && (
        <Part id="centerWheel">
          <CenterWheel m={m} />
        </Part>
      )}
      {show('thirdWheel') && (
        <Part id="thirdWheel">
          <ThirdWheel m={m} />
        </Part>
      )}
      {show('fourthWheel') && (
        <Part id="fourthWheel">
          <FourthWheel m={m} />
        </Part>
      )}
      {show('escapeWheel') && (
        <Part id="escapeWheel">
          <EscapeWheel m={m} />
        </Part>
      )}
      {show('palletFork') && (
        <Part id="palletFork">
          <PalletFork m={m} />
        </Part>
      )}
      {show('balanceWheel') && (
        <Part id="balanceWheel">
          <BalanceWheel m={m} />
        </Part>
      )}
      {show('hairspring') && (
        <Part id="hairspring">
          <Hairspring m={m} />
        </Part>
      )}
      {show('jewels') && (
        <Part id="jewels">
          <Jewels m={m} />
        </Part>
      )}
      {show('bridges') && (
        <Part id="bridges">
          <Bridges m={m} />
        </Part>
      )}
      {show('balanceBridge') && (
        <Part id="balanceBridge">
          <BalanceBridge m={m} />
        </Part>
      )}
      {show('rotor') && (
        <Part id="rotor">
          <Rotor m={m} />
        </Part>
      )}
      {show('caseback') && (
        <Part id="caseback">
          <Caseback m={m} />
        </Part>
      )}

      {show('bracelet') && (
        <Part id="bracelet">
          <Bracelet m={m} type={config.bracelet} twoTone={twoTone} integrated={style.lugs === 'integrated'} wrist={wrist} />
        </Part>
      )}
      {show('clasp') && (
        <Part id="clasp">
          <Clasp m={m} type={config.bracelet} wrist={wrist} />
        </Part>
      )}
      {stage >= STAGES && <ExplodeLines watch={watch} config={config} />}
      {stage >= STAGES && <EnergyFlow />}
    </group>
  )
}
