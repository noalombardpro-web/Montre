import { useEffect, useRef } from 'react'
import { BRACELETS, BRANDS, CATEGORIES, METALS, WATCH_BY_ID, complications, specList } from '../../data/watches'
import { useAtelier } from '../../store/useAtelier'
import { WatchImage } from './WatchThumb'
import { IconClose } from './Icons'

/** Comparateur côte à côte (2 à 3 références). */
export function CompareOverlay({ onClose, onOpen }: { onClose: () => void; onOpen: (id: string) => void }) {
  const lang = useAtelier((s) => s.lang)
  const ids = useAtelier((s) => s.compare)
  const watches = ids.map((id) => WATCH_BY_ID[id]).filter(Boolean)
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const rows: { label: string; values: string[]; best?: number }[] = []
  const specs = watches.map((w) => specList(w, lang))
  specs[0]?.forEach((sp, i) => rows.push({ label: sp.label, values: specs.map((s) => s[i].value) }))
  // mise en évidence des meilleures valeurs numériques
  const highlight = (label: string, nums: number[]) => {
    const row = rows.find((r) => r.label === label)
    if (row) row.best = nums.indexOf(Math.max(...nums))
  }
  highlight(L('Réserve', 'Reserve'), watches.map((w) => w.specs.reserve))
  highlight(L('Étanchéité', 'Water res.'), watches.map((w) => w.specs.water))
  rows.push({ label: L('Famille', 'Family'), values: watches.map((w) => CATEGORIES[w.category][lang]) })
  rows.push({ label: L('Fonctions', 'Functions'), values: watches.map((w) => complications(w, lang).join(' · ')) })
  rows.push({ label: L('Métaux', 'Metals'), values: watches.map((w) => w.metals.map((m) => METALS[m].short[lang]).join(', ')) })
  rows.push({ label: L('Bracelets', 'Bracelets'), values: watches.map((w) => w.bracelets.map((b) => BRACELETS[b].label[lang]).join(', ')) })
  rows.push({ label: L('Maison fondée', 'House founded'), values: watches.map((w) => `${BRANDS[w.brand].founded} · ${BRANDS[w.brand].city}`) })

  return (
    <div role="dialog" aria-modal="true" aria-label={L('Comparateur', 'Comparison')} className="fixed inset-0 z-[70] overflow-y-auto bg-ink/85 p-3 backdrop-blur-md md:p-10" onClick={onClose}>
      <div className="glass mx-auto max-w-5xl p-5 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="eyebrow">{L('Comparateur', 'Comparison')}</div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={L('Fermer', 'Close')} className="-m-2 p-2 text-muted hover:text-ivory">
            <IconClose />
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th className="w-40" />
                {watches.map((w) => (
                  <th key={w.id} className="px-3 pb-5 align-bottom font-normal">
                    <WatchImage def={w} size={84} className="h-[84px] w-[84px]" />
                    <div className="eyebrow mt-3 !text-[9px]">{BRANDS[w.brand].name}</div>
                    <div className="display mt-1 text-2xl">{w.name}</div>
                    <button type="button" className="mt-2 text-[10px] uppercase tracking-[0.22em] text-champagne hover:underline" onClick={() => onOpen(w.id)}>
                      {L('Ouvrir en 3D', 'Open in 3D')} →
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-line">
                  <th scope="row" className="py-3 pr-3 align-top text-[10px] font-normal uppercase tracking-[0.22em] text-muted">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className={`px-3 py-3 align-top ${r.best === i && watches.length > 1 ? 'text-champagne' : 'text-ivory/85'}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
