import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  BRACELETS,
  BRANDS,
  CATEGORIES,
  DIAL_COLORS,
  METALS,
  WATCHES,
  complications,
  fullName,
  specList,
  type BrandId,
  type Category,
  type WatchDef,
} from '../data/watches'
import { PARTS, type Lang } from '../data/parts'
import { ASSEMBLY } from '../data/tours'
import { useAtelier } from '../store/useAtelier'
import { navigate } from '../lib/router'
import { WatchImage } from '../components/ui/WatchThumb'
import { CompareOverlay } from '../components/ui/CompareOverlay'
import { IconArrow, IconClose } from '../components/ui/Icons'

type Sort = 'brand' | 'year' | 'diameter' | 'water'
type Group = { brand: BrandId | null; items: WatchDef[] }

const L = (lang: Lang) => (fr: string, en: string) => (lang === 'fr' ? fr : en)
const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fond animé : aurores dorées / bleutées, grille en dérive, grain et balayage lumineux. */
function CollectionBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <span className="coll-aurora coll-aurora-a" />
      <span className="coll-aurora coll-aurora-b" />
      <span className="coll-aurora coll-aurora-c" />
      <span className="coll-grid" />
      <span className="coll-grain" />
      <span className="coll-scan" />
    </div>
  )
}

/** Compteur qui monte à l'arrivée (désactivé si mouvement réduit). */
function useCountUp(target: number) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (prefersReduced()) {
      setV(target)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400)
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}

function Stat({ value, label }: { value: number; label: string }) {
  const n = useCountUp(value)
  return (
    <div className="bg-ink/70 px-5 py-6 backdrop-blur-sm">
      <dt className="text-[10px] uppercase tracking-[0.26em] text-muted">{label}</dt>
      <dd className="display mt-3 text-5xl tabular-nums text-ivory">{n}</dd>
    </div>
  )
}

/** Bandeau défilant des maisons. */
function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div aria-hidden className="relative mt-14 overflow-hidden border-y border-line py-5">
      <div className="coll-marquee-track flex w-max items-center gap-10 whitespace-nowrap font-serif text-3xl uppercase tracking-[0.18em] text-ivory/25">
        {row.map((n, i) => (
          <span key={i} className="flex items-center gap-10">
            {n}
            <span className="text-gold/70">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function WatchCard({
  w,
  lang,
  compared,
  onOpen,
  onCompare,
}: {
  w: WatchDef
  lang: Lang
  compared: boolean
  onOpen: () => void
  onCompare: () => void
}) {
  const t = L(lang)
  const specs = specList(w, lang)
  const glow = DIAL_COLORS[w.defaults.dial].base
  return (
    <li className="coll-card group flex flex-col bg-char/75 backdrop-blur-sm" style={{ ['--glow' as string]: glow } as CSSProperties}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t('Ouvrir', 'Open')} ${fullName(w)}`}
        className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent)]"
      >
        <span className="coll-glow" aria-hidden />
        <span className="coll-ring" aria-hidden />
        <span className="coll-sheen" aria-hidden />
        <WatchImage def={w} size={360} className="coll-float relative z-10 h-[86%] w-auto max-w-[90%]" />
        <span className="absolute left-4 top-4 z-20 text-[9.5px] uppercase tracking-[0.22em] text-champagne/90">{BRANDS[w.brand].name}</span>
        <span className="absolute right-4 top-4 z-20 text-[10px] tabular-nums text-muted">{w.year}</span>
      </button>

      <div className="flex flex-1 flex-col gap-4 border-t border-line p-6">
        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-muted">
          <span>{CATEGORIES[w.category][lang]}</span>
          <span className="truncate">
            {t('Réf.', 'Ref.')} {w.reference}
          </span>
        </div>
        <div>
          <h3 className="display text-[2.1rem] leading-none text-ivory">{w.name}</h3>
          <p className="mt-2 font-serif text-[1.05rem] italic text-champagne">{w.tagline[lang]}</p>
        </div>
        <p className="text-[13px] leading-relaxed text-ivory/65">{w.intro[lang]}</p>
        <ul className="flex flex-wrap gap-1.5">
          {complications(w, lang).map((c) => (
            <li key={c} className="border border-line px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-ivory/65">
              {c}
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-4 gap-px bg-line">
          {[specs[2], specs[3], specs[5], specs[6]].map((sp) => (
            <div key={sp.label} className="bg-char px-2 py-2.5 text-center">
              <dt className="text-[8.5px] uppercase tracking-[0.18em] text-muted">{sp.label}</dt>
              <dd className="mt-1 truncate text-[12px] text-ivory">{sp.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto space-y-2.5 text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[9px] uppercase tracking-[0.2em]">{t('Cadrans', 'Dials')}</span>
            <span className="flex flex-wrap gap-1.5">
              {w.dials.map((d) => (
                <span key={d} title={DIAL_COLORS[d].label[lang]} className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: DIAL_COLORS[d].base }} />
              ))}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[9px] uppercase tracking-[0.2em]">{t('Métaux', 'Metals')}</span>
            <span className="truncate text-ivory/75">{w.metals.map((m) => METALS[m].short[lang]).join(' · ')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[9px] uppercase tracking-[0.2em]">{t('Bracelets', 'Straps')}</span>
            <span className="truncate text-ivory/75">{w.bracelets.map((b) => BRACELETS[b].label[lang]).join(' · ')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button type="button" onClick={onOpen} className="btn-lux flex-1 justify-center !py-2.5">
            {t('Ouvrir en 3D', 'Open in 3D')} <IconArrow width={14} height={14} />
          </button>
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={compared}
            className={`shrink-0 border px-3 py-2.5 text-[9.5px] uppercase tracking-[0.2em] transition ${compared ? 'border-champagne bg-champagne text-ink' : 'border-line text-muted hover:text-ivory'}`}
          >
            {compared ? '✓ ' : '+ '}
            {t('Comparer', 'Compare')}
          </button>
        </div>
      </div>
    </li>
  )
}

export function Collection() {
  const lang = useAtelier((s) => s.lang)
  const compare = useAtelier((s) => s.compare)
  const t = L(lang)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState<BrandId | null>(null)
  const [cat, setCat] = useState<Category | null>(null)
  const [sort, setSort] = useState<Sort>('brand')
  const [comparing, setComparing] = useState(false)

  const brands = useMemo(() => [...new Set(WATCHES.map((w) => w.brand))], [])
  const cats = useMemo(() => [...new Set(WATCHES.map((w) => w.category))] as Category[], [])
  const brandNames = useMemo(() => brands.map((b) => BRANDS[b].name), [brands])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = WATCHES.filter(
      (w) =>
        (!brand || w.brand === brand) &&
        (!cat || w.category === cat) &&
        (!needle || `${fullName(w)} ${w.reference} ${w.specs.calibre}`.toLowerCase().includes(needle)),
    )
    const by: Record<Sort, (a: WatchDef, b: WatchDef) => number> = {
      brand: (a, b) => BRANDS[a.brand].name.localeCompare(BRANDS[b.brand].name) || a.year - b.year,
      year: (a, b) => b.year - a.year,
      diameter: (a, b) => b.style.diameter - a.style.diameter,
      water: (a, b) => b.specs.water - a.specs.water,
    }
    return [...out].sort(by[sort])
  }, [q, brand, cat, sort])

  const groups = useMemo<Group[]>(() => {
    if (sort !== 'brand') return [{ brand: null, items: list }]
    const map = new Map<BrandId, WatchDef[]>()
    list.forEach((w) => map.set(w.brand, [...(map.get(w.brand) ?? []), w]))
    return [...map.entries()].map(([b, items]) => ({ brand: b, items }))
  }, [list, sort])

  const open = (id: string) => {
    useAtelier.getState().setWatch(id)
    navigate('atelier', id)
  }

  const stats = [
    { v: WATCHES.length, l: t('références', 'references') },
    { v: brands.length, l: t('maisons', 'houses') },
    { v: PARTS.length, l: t('pièces expliquées', 'parts explained') },
    { v: ASSEMBLY.length, l: t('étapes de montage', 'assembly steps') },
  ]

  useEffect(() => {
    document.title = `${t('La collection', 'The collection')} — Watch Atelier`
  }, [t])

  return (
    <div className="relative min-h-[100svh] text-ivory">
      <CollectionBackdrop />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-4 border-b border-line bg-ink/70 px-[var(--gutter)] py-4 backdrop-blur-md">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault()
            navigate('landing')
          }}
          className="flex items-center gap-3"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/60">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="hidden whitespace-nowrap font-serif text-lg tracking-[0.18em] sm:inline">WATCH ATELIER</span>
        </a>
        <button
          type="button"
          className="text-[10.5px] tracking-[0.24em] text-muted hover:text-ivory"
          onClick={() => useAtelier.getState().setLang(lang === 'fr' ? 'en' : 'fr')}
          aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </header>

      <div className="relative z-10 px-[var(--gutter)] pb-40">
        <section className="pb-6 pt-36 md:pt-44">
          <div className="eyebrow">{t('La collection', 'The collection')}</div>
          <h1 className="display mt-5 text-[clamp(3.6rem,10vw,9.5rem)]">
            {t('Garde-temps', 'Timepieces')}
            <span className="block italic text-champagne">{t("d'exception", 'of distinction')}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-ivory/65">
            {t(
              `${WATCHES.length} références, ${brands.length} maisons. Chaque montre est reconstruite pièce par pièce : faites-la tourner, éclatez-la, lisez comment elle fonctionne et comment elle s'assemble.`,
              `${WATCHES.length} references from ${brands.length} houses. Each watch is rebuilt part by part: turn it, explode it, read how it works and how it is assembled.`,
            )}
          </p>
          <dl className="mt-12 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.l} value={s.v} label={s.l} />
            ))}
          </dl>
          <Marquee items={brandNames} />
        </section>

        <section className="sticky top-[73px] z-30 -mx-[var(--gutter)] mt-10 border-y border-line bg-ink/75 px-[var(--gutter)] py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex min-w-[240px] flex-1 items-center gap-3 border-b border-line pb-1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span className="sr-only">{t('Rechercher', 'Search')}</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('Marque, modèle, référence, calibre…', 'Brand, model, reference, calibre…')}
                className="w-full bg-transparent py-1.5 text-sm text-ivory outline-none placeholder:text-muted/70"
              />
            </label>
            <label className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {t('Trier', 'Sort')}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-line bg-char px-2 py-1.5 text-ivory">
                <option value="brand">{t('Maison', 'House')}</option>
                <option value="year">{t('Plus récentes', 'Newest')}</option>
                <option value="diameter">{t('Diamètre', 'Diameter')}</option>
                <option value="water">{t('Étanchéité', 'Water resistance')}</option>
              </select>
            </label>
            <span className="text-[10.5px] uppercase tracking-[0.2em] text-muted" aria-live="polite">
              {list.length} {t('résultat(s)', 'result(s)')}
            </span>
          </div>
          <div role="group" aria-label={t('Maisons', 'Houses')} className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
            <button type="button" className="chip" aria-pressed={!brand} onClick={() => setBrand(null)}>
              {t('Toutes', 'All')}
            </button>
            {brands.map((b) => (
              <button key={b} type="button" className="chip" aria-pressed={brand === b} onClick={() => setBrand(brand === b ? null : b)}>
                {BRANDS[b].name}
              </button>
            ))}
          </div>
          <div role="group" aria-label={t('Familles', 'Families')} className="scrollbar-none mt-2 flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>
                {CATEGORIES[c][lang]}
              </button>
            ))}
          </div>
        </section>

        {list.length === 0 && <p className="mt-16 text-muted">{t('Aucune montre ne correspond à cette recherche.', 'No watch matches this search.')}</p>}

        {groups.map((g) => {
          const b = g.brand ? BRANDS[g.brand] : null
          const families = [...new Set(g.items.map((w) => CATEGORIES[w.category][lang]))].join(' · ')
          return (
            <section key={g.brand ?? 'all'} className="mt-20">
              {b && g.brand && (
                <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
                  <div>
                    <div className="eyebrow">
                      {b.city} · {t('fondée en', 'founded in')} {b.founded}
                    </div>
                    <h2 className="display mt-3 text-5xl md:text-6xl">{b.name}</h2>
                  </div>
                  <p className="max-w-md text-[12.5px] leading-relaxed text-muted">
                    {g.items.length} {t('références', 'references')} · {families}
                  </p>
                </header>
              )}
              <ul className={`${b ? 'mt-8' : ''} grid gap-6 md:grid-cols-2 2xl:grid-cols-3`}>
                {g.items.map((w) => (
                  <WatchCard
                    key={w.id}
                    w={w}
                    lang={lang}
                    compared={compare.includes(w.id)}
                    onOpen={() => open(w.id)}
                    onCompare={() => useAtelier.getState().toggleCompare(w.id)}
                  />
                ))}
              </ul>
            </section>
          )
        })}

        <footer className="mt-24 flex flex-col justify-between gap-4 border-t border-line pt-6 text-[11px] leading-relaxed text-muted md:flex-row">
          <p className="max-w-2xl">
            {t(
              "Projet de démonstration non affilié. Les noms de marques et de modèles sont cités à titre descriptif ; les montres sont des interprétations 3D procédurales sans logo ni marque figurative. Données indicatives.",
              'Unaffiliated demo project. Brand and model names are used descriptively; the watches are procedural 3D interpretations without logos or figurative marks. Indicative data.',
            )}
          </p>
          <p>© {new Date().getFullYear()} Watch Atelier</p>
        </footer>
      </div>

      {compare.length > 0 && (
        <div className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 px-4 py-3 md:inset-x-auto md:left-1/2 md:w-[640px] md:-translate-x-1/2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {compare.map((id) => {
              const w = WATCHES.find((x) => x.id === id)
              return (
                <span key={id} className="flex shrink-0 items-center gap-1.5 border border-line px-2 py-1 text-[11px]">
                  {w?.name}
                  <button type="button" onClick={() => useAtelier.getState().toggleCompare(id)} aria-label={t('Retirer', 'Remove')} className="text-muted hover:text-ivory">
                    <IconClose width={11} height={11} />
                  </button>
                </span>
              )
            })}
          </div>
          <button type="button" className="btn-lux shrink-0 !py-2.5" disabled={compare.length < 2} onClick={() => setComparing(true)}>
            {t('Comparer', 'Compare')} ({compare.length}) <IconArrow width={14} height={14} />
          </button>
        </div>
      )}
      {comparing && <CompareOverlay onClose={() => setComparing(false)} onOpen={open} />}
    </div>
  )
}
