/**
 * Ordonnanceur de tâches lourdes (génération de textures, montage progressif) :
 * une tâche par tranche de temps, entre deux frames, pour éviter les « long tasks »
 * qui bloquent le fil principal (INP / TBT).
 */
type Job = () => void

const queue: Job[] = []
let running = false
const listeners = new Set<() => void>()

const ric: (cb: () => void) => void =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (cb) => window.requestIdleCallback(() => cb(), { timeout: 120 })
    : (cb) => setTimeout(cb, 16)

function pump() {
  const job = queue.shift()
  if (!job) {
    running = false
    listeners.forEach((l) => l())
    return
  }
  try {
    job()
  } finally {
    ric(pump)
  }
}

export function enqueue(job: Job, urgent = false) {
  if (urgent) queue.unshift(job)
  else queue.push(job)
  if (!running) {
    running = true
    ric(pump)
  }
}

export const pendingJobs = () => queue.length + (running ? 1 : 0)

export function onQueueEmpty(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
