import { useEffect, useMemo, useState } from 'react'
import { useAtelier } from '../store/useAtelier'
import { Part } from '../components/three/Part'
import { ExplodeLines } from '../components/three/ExplodeLines'
import { WATCH_BY_ID, type WatchConfig, type WatchId } from '../data/watches'
import { createMaterials, disposeMaterials } from './materials'
import { Caseback, CaseMiddle, Crown, Pushers } from './procedural/CaseParts'
import { Bezel, BezelInsert, Crystal, Cyclops } from './procedural/BezelParts'
import { DateWheel, Dial, HourHand, Indices, MinuteHand, SecondsHand, SubdialHands } from './procedural/DialParts'
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

/**
 * Montre générée entièrement par le code (aucun asset externe) :
 * chaque pièce est un nœud nommé selon parts.json.
 */
export function ProceduralWatch({ id, config, high }: { id: WatchId; config: WatchConfig; high: boolean }) {
  const watch = WATCH_BY_ID[id]
  const m = useMemo(() => createMaterials(watch, config, high), [watch, config, high])
  useEffect(() => () => disposeMaterials(m), [m])
  const bezel = watch.bezels.find((b) => b.id === config.bezel) ?? watch.bezels[0]
  const { date, chrono, crownGuards } = watch.features
  const twoTone = config.metal === 'twotone'
  const stage = useStages()

  return (
    <group name={`watch-${id}`}>
      {stage > 0 && (
        <Part id="case">
          <CaseMiddle m={m} guards={crownGuards} />
        </Part>
      )}
      {stage > 0 && (
        <Part id="crown">
          <Crown m={m} />
        </Part>
      )}
      {stage > 0 && chrono && (
        <Part id="pushers">
          <Pushers m={m} />
        </Part>
      )}
      {stage > 0 && (
        <Part id="bezel">
          <Bezel m={m} style={bezel.style} accent={twoTone} />
        </Part>
      )}
      {stage > 0 && (bezel.style === 'dive' || bezel.style === 'tachy') && (
        <Part id="bezelInsert">
          <BezelInsert m={m} style={bezel.style} />
        </Part>
      )}
      {stage > 2 && (
        <Part id="crystal">
          <Crystal m={m} />
        </Part>
      )}
      {stage > 2 && date && (
        <Part id="cyclops">
          <Cyclops m={m} />
        </Part>
      )}
      {stage > 1 && (
        <Part id="dial">
          <Dial m={m} date={date} />
        </Part>
      )}
      {stage > 1 && (
        <Part id="indices">
          <Indices m={m} model={id} date={date} />
        </Part>
      )}
      {stage > 1 && date && (
        <Part id="dateWheel">
          <DateWheel m={m} />
        </Part>
      )}
      {stage > 1 && (
        <Part id="hourHand">
          <HourHand m={m} model={id} />
        </Part>
      )}
      {stage > 1 && (
        <Part id="minuteHand">
          <MinuteHand m={m} model={id} />
        </Part>
      )}
      {stage > 1 && (
        <Part id="secondsHand">
          <SecondsHand m={m} model={id} chrono={chrono} />
        </Part>
      )}
      {stage > 1 && chrono && (
        <Part id="subdialHands">
          <SubdialHands m={m} />
        </Part>
      )}

      {stage > 5 && (
        <Part id="mainplate">
          <MainPlate m={m} />
        </Part>
      )}
      {stage > 5 && (
        <Part id="barrel">
          <Barrel m={m} />
        </Part>
      )}
      {stage > 5 && (
        <Part id="centerWheel">
          <CenterWheel m={m} />
        </Part>
      )}
      {stage > 5 && (
        <Part id="thirdWheel">
          <ThirdWheel m={m} />
        </Part>
      )}
      {stage > 5 && (
        <Part id="fourthWheel">
          <FourthWheel m={m} />
        </Part>
      )}
      {stage > 6 && (
        <Part id="escapeWheel">
          <EscapeWheel m={m} />
        </Part>
      )}
      {stage > 6 && (
        <Part id="palletFork">
          <PalletFork m={m} />
        </Part>
      )}
      {stage > 6 && (
        <Part id="balanceWheel">
          <BalanceWheel m={m} />
        </Part>
      )}
      {stage > 6 && (
        <Part id="hairspring">
          <Hairspring m={m} />
        </Part>
      )}
      {stage > 6 && (
        <Part id="jewels">
          <Jewels m={m} />
        </Part>
      )}
      {stage > 7 && (
        <Part id="bridges">
          <Bridges m={m} />
        </Part>
      )}
      {stage > 7 && (
        <Part id="balanceBridge">
          <BalanceBridge m={m} />
        </Part>
      )}
      {stage > 7 && (
        <Part id="rotor">
          <Rotor m={m} />
        </Part>
      )}
      {stage > 4 && (
        <Part id="caseback">
          <Caseback m={m} />
        </Part>
      )}

      {stage > 3 && (
        <Part id="bracelet">
          <Bracelet m={m} type={config.bracelet} twoTone={twoTone} />
        </Part>
      )}
      {stage > 4 && (
        <Part id="clasp">
          <Clasp m={m} />
        </Part>
      )}
      {stage >= STAGES && <ExplodeLines watch={id} />}
    </group>
  )
}
