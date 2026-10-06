import { useEffect, useMemo } from 'react'
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

  return (
    <group name={`watch-${id}`}>
      <Part id="case">
        <CaseMiddle m={m} guards={crownGuards} />
      </Part>
      <Part id="crown">
        <Crown m={m} />
      </Part>
      {chrono && (
        <Part id="pushers">
          <Pushers m={m} />
        </Part>
      )}
      <Part id="bezel">
        <Bezel m={m} style={bezel.style} accent={twoTone} />
      </Part>
      {(bezel.style === 'dive' || bezel.style === 'tachy') && (
        <Part id="bezelInsert">
          <BezelInsert m={m} style={bezel.style} />
        </Part>
      )}
      <Part id="crystal">
        <Crystal m={m} />
      </Part>
      {date && (
        <Part id="cyclops">
          <Cyclops m={m} />
        </Part>
      )}
      <Part id="dial">
        <Dial m={m} date={date} />
      </Part>
      <Part id="indices">
        <Indices m={m} model={id} date={date} />
      </Part>
      {date && (
        <Part id="dateWheel">
          <DateWheel m={m} />
        </Part>
      )}
      <Part id="hourHand">
        <HourHand m={m} model={id} />
      </Part>
      <Part id="minuteHand">
        <MinuteHand m={m} model={id} />
      </Part>
      <Part id="secondsHand">
        <SecondsHand m={m} model={id} chrono={chrono} />
      </Part>
      {chrono && (
        <Part id="subdialHands">
          <SubdialHands m={m} />
        </Part>
      )}

      <Part id="mainplate">
        <MainPlate m={m} />
      </Part>
      <Part id="barrel">
        <Barrel m={m} />
      </Part>
      <Part id="centerWheel">
        <CenterWheel m={m} />
      </Part>
      <Part id="thirdWheel">
        <ThirdWheel m={m} />
      </Part>
      <Part id="fourthWheel">
        <FourthWheel m={m} />
      </Part>
      <Part id="escapeWheel">
        <EscapeWheel m={m} />
      </Part>
      <Part id="palletFork">
        <PalletFork m={m} />
      </Part>
      <Part id="balanceWheel">
        <BalanceWheel m={m} />
      </Part>
      <Part id="hairspring">
        <Hairspring m={m} />
      </Part>
      <Part id="jewels">
        <Jewels m={m} />
      </Part>
      <Part id="bridges">
        <Bridges m={m} />
      </Part>
      <Part id="balanceBridge">
        <BalanceBridge m={m} />
      </Part>
      <Part id="rotor">
        <Rotor m={m} />
      </Part>
      <Part id="caseback">
        <Caseback m={m} />
      </Part>

      <Part id="bracelet">
        <Bracelet m={m} type={config.bracelet} twoTone={twoTone} />
      </Part>
      <Part id="clasp">
        <Clasp m={m} />
      </Part>
      <ExplodeLines watch={id} />
    </group>
  )
}
