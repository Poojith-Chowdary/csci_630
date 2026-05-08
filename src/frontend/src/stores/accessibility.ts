import { proxy, subscribe } from 'valtio'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { deserializeToProxyMap } from '@/utils/valtio'
import { storageRepository } from '@/utils/StorageRepository'

type AccessibilityState = {
  announceReactions: boolean
}

const DEFAULT_STATE: AccessibilityState = {
  announceReactions: false,
}

function getAccessibilityState(): AccessibilityState {
  const stored = storageRepository.load<AccessibilityState | null>(
    STORAGE_KEYS.ACCESSIBILITY,
    null
  )
  if (stored) {
    return {
      ...DEFAULT_STATE,
      ...stored,
      announceReactions:
        typeof stored.announceReactions === 'boolean'
          ? stored.announceReactions
          : DEFAULT_STATE.announceReactions,
    }
  }

  // Legacy migration: if the setting was previously stored in notifications
  const legacy = storageRepository.load<Record<string, unknown> | null>(
    STORAGE_KEYS.NOTIFICATIONS,
    null,
    deserializeToProxyMap
  )
  if (legacy && typeof legacy?.announceReactions === 'boolean') {
    const migratedState: AccessibilityState = {
      ...DEFAULT_STATE,
      announceReactions: legacy.announceReactions as boolean,
    }
    storageRepository.save(STORAGE_KEYS.ACCESSIBILITY, migratedState)
    storageRepository.remove(STORAGE_KEYS.NOTIFICATIONS)
    return migratedState
  }

  return DEFAULT_STATE
}

export const accessibilityStore = proxy<AccessibilityState>(
  getAccessibilityState()
)

subscribe(accessibilityStore, () => {
  storageRepository.save(STORAGE_KEYS.ACCESSIBILITY, accessibilityStore)
})
