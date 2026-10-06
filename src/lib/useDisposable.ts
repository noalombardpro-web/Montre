import { useEffect, useMemo, type DependencyList } from 'react'

type Disposable = { dispose: () => void }

/** useMemo qui libère automatiquement les ressources GPU (géométries, textures). */
export function useDisposable<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps)
  useEffect(
    () => () => {
      const list: unknown[] = Array.isArray(value) ? value : typeof value === 'object' && value ? Object.values(value) : []
      if (value && typeof (value as unknown as Disposable).dispose === 'function') (value as unknown as Disposable).dispose()
      else list.forEach((v) => v && typeof (v as Disposable).dispose === 'function' && (v as Disposable).dispose())
    },
    [value],
  )
  return value
}
