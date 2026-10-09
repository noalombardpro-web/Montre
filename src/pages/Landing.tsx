import { useEffect, useLayoutEffect, useRef } from 'react'
import { BRANDS, WATCHES, type WatchId } from '../data/watches'
import { WatchImage } from '../components/ui/WatchThumb'

const FEATURED = WATCHES.filter((w) => w.featured)
import { t } from '../data/i18n'
import { anim, useAtelier } from '../store/useAtelier'
import { navigate } from '../lib/router'
import { setLandingAnchors } from '../scenes/landingKeyframes'
import { IconArrow } from '../components/ui/Icons'
import { HeroPoster } from '../components/ui/HeroPoster'


const COPY = {
  heroEyebrow: { fr: 'Haute horlogerie · Exploration 3D', en: 'Fine watchmaking · 3D exploration' },
  heroTitle: { fr: ["L'art de la", 'décomposition'], en: ['The art of', 'deconstruction'] },
  heroText: {
    fr: 'Trois montres emblématiques, modélisées pièce par pièce. Faites-les tourner, ouvrez-les, observez battre leur cœur.',
    en: 'Three iconic watches, modelled part by part. Turn them, open them, watch their heart beat.',
  },
  scroll: { fr: 'Faire défiler', en: 'Scroll' },
  caseEyebrow: { fr: '01 — La boîte', en: '01 — The case' },
  caseTitle: { fr: 'Forgée pour durer', en: 'Forged to last' },
  caseText: {
    fr: "Usinée dans un bloc d'acier 904L ou d'or 18 carats, la carrure alterne surfaces polies miroir et satinages. Couronne vissée, fond vissé, verre saphir : un écrin étanche pour un mécanisme de précision.",
    en: 'Machined from a block of 904L steel or 18 ct gold, the case alternates mirror polish and satin finishes. Screw-down crown and case back, sapphire crystal: a sealed vault for a precision mechanism.',
  },
  explodedEyebrow: { fr: '02 — Vue éclatée', en: '02 — Exploded view' },
  explodedTitle: { fr: 'Chaque pièce à sa place', en: 'Every part in its place' },
  explodedText: {
    fr: "Verre, lunette, cadran, aiguilles, platine, rouage, échappement, rotor : faites défiler et la montre se déploie le long de son axe de montage, dans l'ordre exact où l'horloger l'assemble.",
    en: 'Crystal, bezel, dial, hands, plate, train, escapement, rotor: scroll and the watch unfolds along its assembly axis, in the exact order a watchmaker puts it together.',
  },
  movementEyebrow: { fr: '03 — Le calibre', en: '03 — The calibre' },
  movementTitle: { fr: 'Un cœur à 4 Hz', en: 'A heart at 4 Hz' },
  movementText: {
    fr: "Le balancier oscille huit fois par seconde, l'ancre libère la roue d'échappement dent après dent, le rotor remonte le ressort au moindre geste. Plus de 70 heures d'autonomie.",
    en: 'The balance swings eight times a second, the pallet fork releases the escape wheel tooth by tooth, the rotor winds the mainspring at the slightest gesture. Over 70 hours of autonomy.',
  },
  collectionEyebrow: { fr: '04 — La collection', en: '04 — The collection' },
  collectionTitle: { fr: 'Choisissez votre pièce', en: 'Choose your piece' },
  legal: {
    fr: "Projet de démonstration non affilié. Les noms de marques et de modèles sont cités à titre descriptif ; les montres sont des interprétations 3D procédurales sans logo ni marque figurative. Données indicatives.",
    en: 'Unaffiliated demo project. Brand and model names are used descriptively; the watches are procedural 3D interpretations without logos or figurative marks. Indicative data.',
  },

}

const STATS = [
  { v: '28 800', l: { fr: 'alternances / heure', en: 'beats / hour' } },
  { v: '31', l: { fr: 'rubis', en: 'jewels' } },
  { v: '70 h', l: { fr: 'réserve de marche', en: 'power reserve' } },
]

export function Landing({ poster = true }: { poster?: boolean }) {
  const lang = useAtelier((s) => s.lang)
    const watchId = useAtelier((s) => s.watchId)
  const root = useRef<HTMLDivElement>(null)

  // Progression du scroll -> scène 3D ; ancres recalées sur les sections réelles
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const computeAnchors = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
      const secs = [...el.querySelectorAll<HTMLElement>('[data-key]')]
      const anchors: number[] = []
      secs.forEach((s) => {
        const top = s.offsetTop
        const h = s.offsetHeight
        const kind = s.dataset.key
        if (kind === 'hold') anchors.push((top + h * 0.2 - innerHeight * 0.3) / max, (top + h * 0.72 - innerHeight * 0.5) / max)
        else if (kind === 'end') anchors.push(1)
        else anchors.push(Math.max(0, (top + h / 2 - innerHeight / 2) / max))
      })
      setLandingAnchors(anchors.map((a) => Math.min(Math.max(a, 0), 1)))
    }
    const onScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1)
      anim.scroll = Math.min(Math.max(scrollY / max, 0), 1)
    }
    const onResize = () => {
      computeAnchors()
      onScroll()
    }
    onResize()
    addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(onResize)
    ro.observe(el)
    return () => {
      removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [])

  // Révélations au scroll
  useEffect(() => {
    const items = root.current?.querySelectorAll('.reveal')
    if (!items) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
      { threshold: 0.25 },
    )
    items.forEach((i) => io.observe(i))
    return () => io.disconnect()
  }, [lang])

  const enter = (id?: WatchId) => {
    if (id) useAtelier.getState().setWatch(id)
    navigate('atelier', id)
  }

  return (
    <div ref={root} className="relative">
      {poster && <HeroPoster />}
      {/* En-tête */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-ink via-ink/70 to-transparent px-[var(--gutter)] pb-8 pt-5 md:bg-none md:py-7">
        <a href="#/" className="flex items-center gap-3" aria-label="Watch Atelier">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/60">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="whitespace-nowrap font-serif text-lg tracking-[0.18em] sm:text-xl">WATCH ATELIER</span>
        </a>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-[10.5px] tracking-[0.24em] text-muted hover:text-ivory"
            onClick={() => useAtelier.getState().setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label={lang === 'fr' ? 'EN — Switch to English' : 'FR — Passer en français'}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <button type="button" onClick={() => enter()} className="btn-lux hidden !py-3 sm:inline-flex">
            {t('enter', lang)}
          </button>
        </div>
      </header>

      {/* 0 — Hero */}
      <section data-key="hero" className="relative flex min-h-[100svh] items-end px-[var(--gutter)] pb-[12svh] md:items-center md:pb-0">
        <div className="hero-intro max-w-2xl">
          <div className="eyebrow">{COPY.heroEyebrow[lang]}</div>
          <h1 className="display mt-6 text-[clamp(3.1rem,6.6vw,6.6rem)]">
            {COPY.heroTitle[lang].map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <span className={`hero-line block ${i === 1 ? 'italic text-champagne' : ''}`} style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/70">{COPY.heroText[lang]}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button type="button" onClick={() => enter()} className="btn-lux">
              {t('enter', lang)} <IconArrow width={16} height={16} />
            </button>
            <a href="#collection" className="eyebrow !text-muted transition hover:!text-ivory">
              {t('catalogue', lang)}
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-hidden>
          <span className="eyebrow !text-[9px] !text-muted">{COPY.scroll[lang]}</span>
          <span className="block h-12 w-px overflow-hidden bg-line">
            <span className="block h-1/2 w-px animate-[scrollcue_2.2s_var(--ease-lux)_infinite] bg-gold" />
          </span>
          <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
        </div>
      </section>

      {/* 1 — Boîte */}
      <section data-key="case" className="flex min-h-[130svh] items-center justify-end px-[var(--gutter)]">
        <Story eyebrow={COPY.caseEyebrow[lang]} title={COPY.caseTitle[lang]} text={COPY.caseText[lang]} align="right" />
      </section>

      {/* 2 — Éclaté (deux ancres : ouverture, puis rotation) */}
      <section data-key="hold" className="relative min-h-[240svh] px-[var(--gutter)]">
        <div className="sticky top-0 flex min-h-[100svh] items-end pb-[10svh] md:items-center md:pb-0">
          <Story eyebrow={COPY.explodedEyebrow[lang]} title={COPY.explodedTitle[lang]} text={COPY.explodedText[lang]} align="left" />
        </div>
      </section>

      {/* 3 — Mouvement */}
      <section data-key="movement" className="flex min-h-[140svh] items-end justify-end px-[var(--gutter)] pb-[10svh] md:items-center md:pb-0">
        <div>
          <Story eyebrow={COPY.movementEyebrow[lang]} title={COPY.movementTitle[lang]} text={COPY.movementText[lang]} align="right" />
          <dl className="reveal mt-10 grid max-w-md grid-cols-3 gap-6 md:ml-auto">
            {STATS.map((s) => (
              <div key={s.v} className="border-t border-line pt-4">
                <dd className="display text-4xl text-champagne">{s.v}</dd>
                <dt className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted">{s.l[lang]}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 4 — Collection */}
      <section id="collection" data-key="end" className="flex min-h-[100svh] flex-col justify-end px-[var(--gutter)] pb-10 pt-[45svh] md:pt-[52svh]">
        <div className="reveal mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow">{COPY.collectionEyebrow[lang]}</div>
            <h2 className="display mt-4 text-5xl md:text-6xl">{COPY.collectionTitle[lang]}</h2>
          </div>
        </div>
        <ul className="reveal grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((w) => (
            <li key={w.id} className="bg-ink">
              <button
                type="button"
                onMouseEnter={() => useAtelier.getState().setWatch(w.id)}
                onFocus={() => useAtelier.getState().setWatch(w.id)}
                onClick={() => enter(w.id)}
                className={`group flex w-full items-center gap-4 p-5 text-left transition duration-700 ${watchId === w.id ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
              >
                <WatchImage def={w} size={58} className="h-[58px] w-[58px] shrink-0" />
                <span className="min-w-0">
                  <span className="eyebrow block !text-[9px]">{BRANDS[w.brand].name}</span>
                  <span className="display mt-1 block truncate text-2xl">{w.name}</span>
                  <span className="mt-1 block truncate text-[11.5px] text-ivory/55">{w.tagline[lang]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="reveal mt-6 flex flex-wrap items-center gap-6">
          <a
            href="#/collection"
            className="btn-lux"
            onClick={(e) => {
              e.preventDefault()
              navigate('collection')
            }}
          >
            {lang === 'fr' ? `Voir les ${WATCHES.length} montres` : `See all ${WATCHES.length} watches`} <IconArrow width={16} height={16} />
          </a>
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {new Set(WATCHES.map((w) => w.brand)).size} {lang === 'fr' ? 'maisons · recherche · comparateur' : 'houses · search · comparison'}
          </span>
        </div>
        <footer className="mt-10 flex flex-col justify-between gap-4 border-t border-line pt-6 text-[11px] leading-relaxed text-muted md:flex-row">
          <p className="max-w-2xl">{COPY.legal[lang]}</p>
          <p>© {new Date().getFullYear()} Watch Atelier</p>
        </footer>
      </section>
    </div>
  )
}

function Story({ eyebrow, title, text, align }: { eyebrow: string; title: string; text: string; align: 'left' | 'right' }) {
  return (
    <div className={`reveal glass-soft max-w-md ${align === 'right' ? 'md:text-right' : ''}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="display mt-5 text-5xl md:text-7xl">{title}</h2>
      <div className={`hairline my-7 w-24 ${align === 'right' ? 'md:ml-auto' : ''}`} />
      <p className="text-[15px] leading-relaxed text-ivory/70">{text}</p>
    </div>
  )
}
