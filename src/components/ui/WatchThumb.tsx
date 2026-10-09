import { memo } from 'react'
import { DIAL_COLORS, type WatchConfig, type WatchDef } from '../../data/watches'
import { METAL_COLOR } from '../../data/metals'
import { dialLayout } from '../../models/dialLayout'

const TAU = Math.PI * 2
const STRAP: Record<string, string> = {
  'leather-brown': '#4a2a17',
  'leather-black': '#1a191a',
  'leather-blue': '#1a2a4f',
  'rubber-black': '#18181a',
  'rubber-blue': '#1d3160',
  canvas: '#33383e',
}
const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']

function metalOf(cfg: WatchConfig, accent = false) {
  const m = cfg.metal
  if (m === 'twotone') return accent ? METAL_COLOR.yellow : METAL_COLOR.steel
  if (m === 'twotone-rose') return accent ? METAL_COLOR.rose : METAL_COLOR.steel
  return METAL_COLOR[m]
}

/**
 * Vignette vectorielle d'une référence, générée depuis son descripteur de style :
 * instantanée, nette à toutes les tailles, sans rendu 3D.
 */
export const WatchThumb = memo(function WatchThumb({ def, config, size = 160 }: { def: WatchDef; config?: WatchConfig; size?: number }) {
  const cfg = config ?? def.defaults
  const s = def.style
  const L = dialLayout(s)
  const dial = DIAL_COLORS[cfg.dial]
  const metal = metalOf(cfg)
  const accent = metalOf(cfg, true)
  const bezel = def.bezels.find((b) => b.id === cfg.bezel) ?? def.bezels[0]
  const id = def.id.replace(/[^a-z0-9]/gi, '')
  const k = 2.1 // px par mm (vue de 100 × 130)
  const cx = 50
  const cy = 65
  const R = 20 * k * (s.diameter / 41)
  const dialR = R * 0.76
  const strap = STRAP[cfg.bracelet]
  const wB = 19 * k * 0.98
  const insert = bezel.insert ?? null
  const poly = (n: number, r: number, rot = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i / n) * TAU
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
    }).join(' ')
  const hand = (frac: number, len: number, w: number, color: string) => {
    const a = frac * TAU - Math.PI / 2
    return <line x1={cx} y1={cy} x2={cx + Math.cos(a) * len} y2={cy + Math.sin(a) * len} stroke={color} strokeWidth={w} strokeLinecap="round" />
  }
  const handColor = s.handColor === 'blued' ? '#2b4fb5' : s.handColor === 'gold' ? accent : '#f2f3f5'
  const at = (frac: number, r: number) => [cx + Math.cos(frac * TAU - Math.PI / 2) * r, cy + Math.sin(frac * TAU - Math.PI / 2) * r]

  return (
    <svg viewBox="0 0 100 130" width={size} height={(size * 130) / 100} role="img" aria-label={def.name}>
      <defs>
        <linearGradient id={`m-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.35" stopColor={metal} />
          <stop offset="0.7" stopColor={metal} stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`a-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.4" stopColor={accent} />
          <stop offset="1" stopColor={accent} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`d-${id}`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor={dial.base} stopOpacity="0.75" />
          <stop offset="0.6" stopColor={dial.base} />
          <stop offset="1" stopColor="#000" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {/* bracelet */}
      {strap ? (
        <>
          <rect x={cx - wB / 2} y={0} width={wB} height={cy} rx={4} fill={strap} />
          <rect x={cx - wB / 2} y={cy} width={wB} height={130 - cy} rx={4} fill={strap} />
        </>
      ) : (
        Array.from({ length: 9 }, (_, i) => {
          const y = i < 4 ? i * 7.5 - 4 : cy + 22 + (i - 4) * 7.5
          return (
            <g key={i}>
              <rect x={cx - wB / 2} y={y} width={wB * 0.3} height={6.6} rx={1.2} fill={`url(#m-${id})`} />
              <rect x={cx - wB * 0.18} y={y} width={wB * 0.36} height={6.6} rx={1.2} fill={cfg.metal.startsWith('twotone') ? `url(#a-${id})` : `url(#m-${id})`} />
              <rect x={cx + wB * 0.2} y={y} width={wB * 0.3} height={6.6} rx={1.2} fill={`url(#m-${id})`} />
            </g>
          )
        })
      )}
      {/* cornes + boîtier */}
      <rect x={cx - R * 0.72} y={cy - R * 1.22} width={R * 1.44} height={R * 2.44} rx={R * 0.3} fill={`url(#m-${id})`} />
      <circle cx={cx + R + 1.4} cy={cy} r={2.4} fill={`url(#a-${id})`} />
      {s.chrono && (
        <>
          <rect x={cx + R * 0.86} y={cy - R * 0.62} width={4} height={3} rx={1} fill={`url(#m-${id})`} transform={`rotate(-30 ${cx + R} ${cy - R * 0.5})`} />
          <rect x={cx + R * 0.86} y={cy + R * 0.5} width={4} height={3} rx={1} fill={`url(#m-${id})`} transform={`rotate(30 ${cx + R} ${cy + R * 0.5})`} />
        </>
      )}
      {/* lunette */}
      {bezel.style === 'octagon' || bezel.style === 'hexagon' ? (
        <polygon points={poly(bezel.style === 'octagon' ? 8 : 6, R * 1.04, bezel.style === 'octagon' ? Math.PI / 8 : 0)} fill={`url(#m-${id})`} stroke="#00000033" strokeWidth={0.4} />
      ) : (
        <circle cx={cx} cy={cy} r={R} fill={cfg.metal.startsWith('twotone') ? `url(#a-${id})` : `url(#m-${id})`} />
      )}
      {bezel.style === 'fluted' &&
        Array.from({ length: 48 }, (_, i) => {
          const a = (i / 48) * TAU
          return <line key={i} x1={cx + Math.cos(a) * R * 0.86} y1={cy + Math.sin(a) * R * 0.86} x2={cx + Math.cos(a) * R * 0.99} y2={cy + Math.sin(a) * R * 0.99} stroke="#00000040" strokeWidth={0.5} />
        })}
      {bezel.style === 'octagon' && bezel.screws &&
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * TAU
          return <circle key={i} cx={cx + Math.cos(a) * R * 0.9} cy={cy + Math.sin(a) * R * 0.9} r={0.9} fill="#e6e8eb" stroke="#0004" strokeWidth={0.2} />
        })}
      {insert && bezel.style === 'gmt' && bezel.insert2 ? (
        <>
          <path d={`M ${cx - R * 0.95} ${cy} A ${R * 0.95} ${R * 0.95} 0 0 1 ${cx + R * 0.95} ${cy} Z`} fill={insert} />
          <path d={`M ${cx + R * 0.95} ${cy} A ${R * 0.95} ${R * 0.95} 0 0 1 ${cx - R * 0.95} ${cy} Z`} fill={bezel.insert2} />
        </>
      ) : insert ? (
        <circle cx={cx} cy={cy} r={R * 0.95} fill={insert} />
      ) : null}
      {(insert || bezel.style === 'slide') &&
        Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = at(i / 12, R * 0.8)
          const [x2, y2] = at(i / 12, R * 0.9)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8eaee" strokeWidth={i === 0 ? 1.4 : 0.7} />
        })}
      {/* cadran */}
      <circle cx={cx} cy={cy} r={dialR} fill={`url(#d-${id})`} />
      {s.pattern === 'tapisserie' &&
        Array.from({ length: 13 }, (_, i) => (
          <g key={i} opacity={0.18}>
            <line x1={cx - dialR} y1={cy - dialR + i * (dialR / 6)} x2={cx + dialR} y2={cy - dialR + i * (dialR / 6)} stroke="#fff" strokeWidth={0.25} />
            <line x1={cx - dialR + i * (dialR / 6)} y1={cy - dialR} x2={cx - dialR + i * (dialR / 6)} y2={cy + dialR} stroke="#fff" strokeWidth={0.25} />
          </g>
        ))}
      {L.subdials.map((d, i) => (
        <circle key={i} cx={cx + (d.x / 15.2) * dialR} cy={cy - (d.y / 15.2) * dialR} r={(d.r / 15.2) * dialR} fill={dial.sub} opacity={0.9} />
      ))}
      {Array.from({ length: 12 }, (_, h) => {
        if (L.skipHours.has(h)) return null
        if (s.indices === 'roman') {
          const [x, y] = at(h / 12, dialR * 0.8)
          return (
            <text key={h} x={x} y={y + 1.2} fontSize={3.2} textAnchor="middle" fill={dial.print} fontFamily="serif">
              {ROMAN[h]}
            </text>
          )
        }
        if (s.indices === 'arabic' || (s.indices === 'explorer' && h % 3 === 0 && h)) {
          const [x, y] = at(h / 12, dialR * 0.74)
          return (
            <text key={h} x={x} y={y + 1.6} fontSize={s.indices === 'explorer' ? 6 : 4.2} fontWeight={700} textAnchor="middle" fill={dial.print} fontFamily="sans-serif">
              {h === 0 ? '▼' : h}
            </text>
          )
        }
        const [x1, y1] = at(h / 12, dialR * 0.78)
        const [x2, y2] = at(h / 12, dialR * (s.indices === 'short' ? 0.88 : 0.95))
        if (s.indices === 'dive' && h % 3 !== 0) return <circle key={h} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={2} fill="#eef1e6" stroke="#ccc" strokeWidth={0.3} />
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eceef1" strokeWidth={h === 0 ? 2.4 : 1.6} />
      })}
      {L.date && (
        <rect
          x={cx + Math.cos(-L.date.angle) * (L.date.r / 15.2) * dialR - 3.4}
          y={cy + Math.sin(-L.date.angle) * (L.date.r / 15.2) * dialR - 2.6}
          width={6.8}
          height={5.2}
          fill="#f4f2ec"
          stroke="#0003"
          strokeWidth={0.3}
        />
      )}
      {L.moon && <path d={`M ${cx - 5} ${cy + 15} A 5 5 0 0 1 ${cx + 5} ${cy + 15} Z`} fill="#16285c" />}
      {hand(10 / 12 + 8 / 720, dialR * 0.55, 2.4, handColor)}
      {hand(8 / 60, dialR * 0.85, 1.7, handColor)}
      {s.gmt && hand(0.6, dialR * 0.88, 0.8, s.gmtColor ?? '#c8322a')}
      {!s.smallSeconds && hand(37 / 60, dialR * 0.9, 0.5, s.handColor === 'blued' ? handColor : '#e94a3f')}
      <circle cx={cx} cy={cy} r={1.5} fill={handColor} />
      {/* reflet du verre */}
      <path d={`M ${cx - dialR * 0.8} ${cy - dialR * 0.2} A ${dialR} ${dialR} 0 0 1 ${cx + dialR * 0.3} ${cy - dialR * 0.85}`} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} fill="none" />
    </svg>
  )
})
