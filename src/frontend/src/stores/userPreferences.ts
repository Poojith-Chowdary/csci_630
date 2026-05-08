import { proxy } from 'valtio'
import { subscribe } from 'valtio/index'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { storageRepository } from '@/utils/StorageRepository'

type State = {
  is_idle_disconnect_modal_enabled: boolean
}

const DEFAULT_STATE = {
  is_idle_disconnect_modal_enabled: true,
}

function getUserPreferencesState(): State {
  return storageRepository.load<State>(
    STORAGE_KEYS.USER_PREFERENCES,
    DEFAULT_STATE
  )
}

export const userPreferencesStore = proxy<State>(getUserPreferencesState())

subscribe(userPreferencesStore, () => {
  storageRepository.save(STORAGE_KEYS.USER_PREFERENCES, userPreferencesStore)
})
