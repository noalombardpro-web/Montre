import { useMemo, useState } from 'react'
import { BRANDS, CATEGORIES, WATCHES, fullName, specList, type BrandId, type Category } from '../data/watches'
import { useAtelier } from '../store/useAtelier'
import { navigate } from '../lib/router'
import { WatchThumb } from '../components/ui/WatchThumb'
import { CompareOverlay } from '../components/ui/CompareOverlay'
import { IconArrow, IconClose } from '../components/ui/Icons'

type Sort = 'brand' | 'year' | 'diameter' | 'water'

/** Collection complète : recherche, filtres par maison et par famille, tri, comparateur. */
export function Collection() {
  const lang = useAtelier((s) => s.lang)
  const compare = useAtelier((s) => s.compare)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState<BrandId | null>(null)
  const [cat, setCat] = useState<Category | null>(null)
  const [sort, setSort] = useState<Sort>('brand')
  const [comparing, setComparing] = useState(false)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = WATCHES.filter(
      (w) =>
        (!brand || w.brand === brand) &&
        (!cat || w.category === cat) &&
        (!needle || `${fullName(w)} ${w.reference} ${w.specs.calibre}`.toLowerCase().includes(needle)),
    )
    const by: Record<Sort, (a: (typeof WATCHES)[number], b: (typeof WATCHES)[number]) => number> = {
      brand: (a, b) => BRANDS[a.brand].name.localeCompare(BRANDS[b.brand].name) || a.year - b.year,
      year: (a, b) => b.year - a.year,
      diameter: (a, b) => b.style.diameter - a.style.diameter,
      water: (a, b) => b.specs.water - a.specs.water,
    }
    return [...out].sort(by[sort])
  }, [q, brand, cat, sort])

  const brands = useMemo(() => [...new Set(WATCHES.map((w) => w.brand))], [])
  const open = (id: string) => {
    useAtelier.getState().setWatch(id)
    navigate('atelier', id)
  }

  return (
    <div className="min-h-[100svh] bg-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/90 px-[var(--gutter)] py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#/"
            className="flex items-center gap-3"
            onClick={(e) => {
              e.preventDefault()
              navigate('landing')
            }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/60">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            <span className="hidden whitespace-nowrap font-serif text-lg tracking-[0.18em] sm:inline">WATCH ATELIER</span>
          </a>
          <label className="flex max-w-md flex-1 items-center gap-3 border-b border-line pb-1">
            <span className="sr-only">{L('Rechercher', 'Search')}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={L('Marque, modèle, référence, calibre…', 'Brand, model, reference, calibre…')}
              className="w-full bg-transparent py-1.5 text-sm text-ivory outline-none placeholder:text-muted/70"
            />
          </label>
          <button
            type="button"
            className="text-[10.5px] tracking-[0.24em] text-muted hover:text-ivory"
            onClick={() => useAtelier.getState().setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <main className="px-[var(--gutter)] pb-32 pt-10">
        <div className="eyebrow">{L('La collection', 'The collection')}</div>
        <h1 className="display mt-4 text-5xl md:text-7xl">
          {WATCHES.length} {L('garde-temps', 'timepieces')}, {brands.length} {L('maisons', 'houses')}
        </h1>
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted">
          {L(
            "Interprétations 3D procédurales de références réelles. Noms de marques et de modèles cités à titre descriptif ; aucun logo n'est reproduit. Données techniques indicatives.",
            'Procedural 3D interpretations of real references. Brand and model names are used descriptively; no logos are reproduced. Technical data is indicative.',
          )}
        </p>

        {/* Filtres */}
        <div className="mt-8 space-y-3">
          <div role="group" aria-label={L('Maisons', 'Houses')} className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            <button type="button" className="chip" aria-pressed={!brand} onClick={() => setBrand(null)}>
              {L('Toutes', 'All')}
            </button>
            {brands.map((b) => (
              <button key={b} type="button" className="chip" aria-pressed={brand === b} onClick={() => setBrand(brand === b ? null : b)}>
                {BRANDS[b].name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label={L('Familles', 'Families')} className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {(Object.keys(CATEGORIES) as Category[]).map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>
                  {CATEGORIES[c][lang]}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
              {L('Trier', 'Sort')}
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-line bg-char px-2 py-1.5 text-ivory">
                <option value="brand">{L('Maison', 'House')}</option>
                <option value="year">{L('Plus récentes', 'Newest')}</option>
                <option value="diameter">{L('Diamètre', 'Diameter')}</option>
                <option value="water">{L('Étanchéité', 'Water resistance')}</option>
              </select>
            </label>
          </div>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-muted" aria-live="polite">
          {list.length} {L('résultat(s)', 'result(s)')}
        </p>

        {/* Grille */}
        <ul className="mt-4 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((w) => {
            const specs = specList(w, lang)
            const inCompare = compare.includes(w.id)
            return (
              <li key={w.id} className="group relative bg-ink">
                <button type="button" onClick={() => open(w.id)} className="flex w-full gap-5 p-5 pb-12 text-left transition hover:bg-white/[0.025] md:p-6 md:pb-12">
                  <div className="shrink-0 transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-105">
                    <WatchThumb def={w} size={92} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="eyebrow !text-[9px]">
                      {BRANDS[w.brand].name} · {CATEGORIES[w.category][lang]}
                    </div>
                    <div className="display mt-1.5 text-[1.7rem] leading-tight">{w.name}</div>
                    <div className="mt-1 text-[11px] text-muted">
                      {L("Réf.", "Ref.")} {w.reference} · {w.year}
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ivory/60">{w.tagline[lang]}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-muted">
                      <span>{specs[2].value}</span>
                      <span>{specs[3].value}</span>
                      <span>{specs[5].value}</span>
                      <span>{specs[6].value}</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => useAtelier.getState().toggleCompare(w.id)}
                  aria-pressed={inCompare}
                  className={`absolute bottom-4 right-4 border px-2 py-1 text-[9.5px] uppercase tracking-[0.2em] transition ${inCompare ? 'border-champagne bg-champagne text-ink' : 'border-line text-muted hover:text-ivory'}`}
                >
                  {inCompare ? '✓ ' : '+ '}
                  {L('Comparer', 'Compare')}
                </button>
              </li>
            )
          })}
        </ul>
      </main>

      {compare.length > 0 && (
        <div className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 px-4 py-3 md:inset-x-auto md:left-1/2 md:w-[640px] md:-translate-x-1/2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {compare.map((id) => {
              const w = WATCHES.find((x) => x.id === id)!
              return (
                <span key={id} className="flex shrink-0 items-center gap-1.5 border border-line px-2 py-1 text-[11px]">
                  {w.name}
                  <button type="button" onClick={() => useAtelier.getState().toggleCompare(id)} aria-label={L('Retirer', 'Remove')} className="text-muted hover:text-ivory">
                    <IconClose width={11} height={11} />
                  </button>
                </span>
              )
            })}
          </div>
          <button type="button" className="btn-lux shrink-0 !py-2.5" disabled={compare.length < 2} onClick={() => setComparing(true)}>
            {L('Comparer', 'Compare')} ({compare.length}) <IconArrow width={14} height={14} />
          </button>
        </div>
      )}
      {comparing && <CompareOverlay onClose={() => setComparing(false)} onOpen={open} />}
    </div>
  )
}
