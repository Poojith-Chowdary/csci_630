import { useEffect, useState } from 'react'

/**
 * Implementation used from https://github.com/juliencrn/usehooks-ts
 * Updated to be SSR-safe and use modern matchMedia addEventListener API.
 *
 * @internal
 */

const getMatchMedia = (): Window['matchMedia'] | undefined =>
  globalThis.window?.matchMedia

const getMatches = (query: string): boolean => {
  const matchMedia = getMatchMedia()
  if (typeof matchMedia !== 'function') return false
  return matchMedia(query).matches
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => getMatches(query))

  useEffect(() => {
    const matchMedia = getMatchMedia()
    if (typeof matchMedia !== 'function') return

    const mql = matchMedia(query)
    setMatches(mql.matches)

    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => {
        mql.removeEventListener('change', onChange)
      }
    }

    const legacy = mql as {
      addListener?: (cb: (e: MediaQueryListEvent) => void) => void
      removeListener?: (cb: (e: MediaQueryListEvent) => void) => void
    }
    legacy.addListener?.(onChange)
    return () => {
      legacy.removeListener?.(onChange)
    }
  }, [query])

  return matches
}
