/**
 * StorageRepository: a testable abstraction over localStorage.
 *
 * Before this abstraction, each store (userPreferences, notifications,
 * accessibility) and silentLogin contained identical try/catch localStorage
 * boilerplate with raw string keys scattered across files. This created:
 *   - Duplicated error handling in every store
 *   - No way to swap the storage backend without editing every consumer
 *   - Impossible to unit test without mocking localStorage per-file
 *
 * The LocalStorageRepository centralises all of that. Swapping to
 * sessionStorage or a server API now requires changing one class only.
 *
 * Pattern: Repository (Structural) — wraps a storage mechanism behind
 * a stable interface so consumers depend on the abstraction, not the
 * implementation.
 */
export interface IStorageRepository {
  load<T>(
    key: string,
    defaultValue: T,
    reviver?: (key: string, value: unknown) => unknown
  ): T
  save<T>(
    key: string,
    value: T,
    replacer?: (key: string, value: unknown) => unknown
  ): void
  remove(key: string): void
}

export class LocalStorageRepository implements IStorageRepository {
  load<T>(
    key: string,
    defaultValue: T,
    reviver?: (key: string, value: unknown) => unknown
  ): T {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaultValue
      return JSON.parse(stored, reviver) as T
    } catch (error) {
      console.error(`[StorageRepository] Failed to load key "${key}":`, error)
      return defaultValue
    }
  }

  save<T>(
    key: string,
    value: T,
    replacer?: (key: string, value: unknown) => unknown
  ): void {
    try {
      localStorage.setItem(key, JSON.stringify(value, replacer))
    } catch (error) {
      console.error(`[StorageRepository] Failed to save key "${key}":`, error)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`[StorageRepository] Failed to remove key "${key}":`, error)
    }
  }
}

export const storageRepository = new LocalStorageRepository()
