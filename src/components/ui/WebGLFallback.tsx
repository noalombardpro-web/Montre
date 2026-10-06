import { useAtelier } from '../../store/useAtelier'
import { t } from '../../data/i18n'

/** Repli élégant si WebGL 2 est indisponible : illustration vectorielle statique. */
export function WebGLFallback() {
  const lang = useAtelier((s) => s.lang)
  return (
    <div className="fixed inset-0 z-0 grid place-items-center bg-ink" aria-hidden={false}>
      <div className="flex flex-col items-center gap-6 px-6 text-center opacity-80">
        <svg width="220" height="300" viewBox="0 0 220 300" role="img" aria-label="Illustration de montre">
          <rect x="70" y="0" width="80" height="70" rx="10" fill="#17171b" stroke="#2a2a30" />
          <rect x="70" y="230" width="80" height="70" rx="10" fill="#17171b" stroke="#2a2a30" />
          <circle cx="110" cy="150" r="86" fill="#1b1b20" stroke="#c9a96a" strokeOpacity=".6" />
          <circle cx="110" cy="150" r="66" fill="#0c1a36" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="108" y="90" width="4" height="12" fill="#ece8e1" transform={`rotate(${i * 30} 110 150)`} />
          ))}
          <line x1="110" y1="150" x2="110" y2="104" stroke="#ece8e1" strokeWidth="4" strokeLinecap="round" transform="rotate(300 110 150)" />
          <line x1="110" y1="150" x2="110" y2="96" stroke="#ece8e1" strokeWidth="3" strokeLinecap="round" transform="rotate(60 110 150)" />
          <rect x="196" y="142" width="12" height="16" rx="3" fill="#c9a96a" />
        </svg>
        <p className="max-w-sm text-sm text-muted">{t('noWebgl', lang)}</p>
      </div>
    </div>
  )
}
