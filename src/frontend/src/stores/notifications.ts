import { proxy, subscribe } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { deserializeToProxyMap, serializeProxyMap } from '@/utils/valtio'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { storageRepository } from '@/utils/StorageRepository'
import { NotificationType } from '@/features/notifications/NotificationType'

type State = {
  soundNotifications: Map<NotificationType, boolean>
  soundNotificationVolume: number
}

const DEFAULT_STATE: State = {
  soundNotifications: proxyMap(
    new Map([
      [NotificationType.ParticipantJoined, true],
      [NotificationType.HandRaised, true],
      [NotificationType.MessageReceived, true],
    ])
  ),
  soundNotificationVolume: 0.1,
}

function getNotificationsState(): State {
  const parsed = storageRepository.load<State | null>(
    STORAGE_KEYS.NOTIFICATIONS,
    null,
    deserializeToProxyMap
  )
  if (!parsed) return DEFAULT_STATE
  // Ensure all default notification types exist in the recovered state
  return {
    ...DEFAULT_STATE,
    ...parsed,
    soundNotifications: proxyMap(
      new Map(
        Array.from(DEFAULT_STATE.soundNotifications.keys()).map((key) => [
          key,
          parsed.soundNotifications instanceof Map &&
          parsed.soundNotifications.has(key)
            ? (parsed.soundNotifications.get(key) ??
              DEFAULT_STATE.soundNotifications.get(key)!)
            : DEFAULT_STATE.soundNotifications.get(key)!,
        ])
      )
    ),
  }
}

export const notificationsStore = proxy<State>(getNotificationsState())

subscribe(notificationsStore, () => {
  storageRepository.save(
    STORAGE_KEYS.NOTIFICATIONS,
    notificationsStore,
    serializeProxyMap
  )
})
