import { useCallback, useEffect, useMemo, useState } from 'react'
import { partsFor, PART_BY_ID, type PartMeta } from '../../data/parts'
import { WATCH_BY_ID } from '../../data/watches'
import { useAtelier } from '../../store/useAtelier'
import { IconClose } from './Icons'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

/** Quiz : une pièce est isolée et mise en lumière ; il faut retrouver son nom. */
export function QuizPanel() {
  const quiz = useAtelier((s) => s.quiz)
  const lang = useAtelier((s) => s.lang)
  const watchId = useAtelier((s) => s.watchId)
  const cfg = useAtelier((s) => s.configs[s.watchId])
  const pool = useMemo(() => partsFor(WATCH_BY_ID[watchId], cfg), [watchId, cfg])
  const [target, setTarget] = useState<PartMeta | null>(null)
  const [choices, setChoices] = useState<PartMeta[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const L = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const next = useCallback(() => {
    const t = pool[Math.floor(Math.random() * pool.length)]
    setTarget(t)
    setChoices(shuffle([t, ...shuffle(pool.filter((p) => p.id !== t.id)).slice(0, 3)]))
    setAnswer(null)
    const s = useAtelier.getState()
    // les pièces du mouvement se voient mieux en vue éclatée
    s.set({ explode: t.group === 'movement' ? 1 : 0, mode: t.group === 'movement' ? 'exploded' : 'normal' })
    s.set({ selected: t.id, isolate: true })
  }, [pool])

  useEffect(() => {
    if (quiz) {
      setScore({ ok: 0, total: 0 })
      next()
    } else setTarget(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz])

  if (!quiz || !target) return null
  const choose = (id: string) => {
    if (answer) return
    setAnswer(id)
    setScore((s) => ({ ok: s.ok + (id === target.id ? 1 : 0), total: s.total + 1 }))
  }
  const right = answer === target.id

  return (
    <aside aria-label={L('Quiz des pièces', 'Parts quiz')} className="glass pointer-events-auto fixed inset-x-3 bottom-3 z-30 p-6 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:w-[380px] md:p-8">
      <div className="flex items-center justify-between">
        <div className="eyebrow">
          {L('Quiz', 'Quiz')} · {score.ok}/{score.total}
        </div>
        <button type="button" onClick={() => useAtelier.getState().set({ quiz: false, selected: null, isolate: false })} className="-m-2 p-2 text-muted hover:text-ivory" aria-label={L('Quitter le quiz', 'Exit quiz')}>
          <IconClose />
        </button>
      </div>
      <h2 className="display mt-4 text-3xl">{L('Quelle est cette pièce ?', 'Which part is this?')}</h2>
      <p className="mt-2 text-[12.5px] text-muted">{L('Indice : ', 'Hint: ')}{target.function[lang]}</p>
      <ul className="mt-5 space-y-2">
        {choices.map((c) => {
          const state = !answer ? '' : c.id === target.id ? 'border-emerald-400/70 text-emerald-200' : c.id === answer ? 'border-red-400/70 text-red-200' : 'opacity-50'
          return (
            <li key={c.id}>
              <button type="button" onClick={() => choose(c.id)} disabled={!!answer} className={`w-full border border-line px-4 py-2.5 text-left font-serif text-lg transition hover:border-white/30 ${state}`}>
                {c.name[lang]}
              </button>
            </li>
          )
        })}
      </ul>
      {answer && (
        <div className="mt-5" aria-live="polite">
          <p className={`text-sm ${right ? 'text-emerald-200' : 'text-red-200'}`}>
            {right ? L('Exact !', 'Correct!') : `${L('Raté — c’était', 'Missed — it was')} ${PART_BY_ID[target.id].name[lang]}.`}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{target.funFact[lang]}</p>
          <button type="button" className="btn-lux mt-4 w-full justify-center !py-3" onClick={next} autoFocus>
            {L('Pièce suivante', 'Next part')}
          </button>
        </div>
      )}
    </aside>
  )
}
