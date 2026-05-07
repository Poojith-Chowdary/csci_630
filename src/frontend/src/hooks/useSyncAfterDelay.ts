import { useDebounceValue } from 'usehooks-ts'

/**
 * If value stays truthy for more than waitFor ms, syncValue takes the value of value.
 * Delegates to useDebounceValue from usehooks-ts (backed by lodash.debounce)
 * instead of a hand-rolled setTimeout implementation.
 * @param value
 * @param waitFor
 * @returns
 */
export function useSyncAfterDelay<T>(value: T, waitFor: number = 300) {
  const [debouncedValue] = useDebounceValue(value, waitFor)
  return value ? debouncedValue : value
}
