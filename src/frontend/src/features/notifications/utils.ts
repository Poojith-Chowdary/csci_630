import { toastQueue } from './components/ToastProvider'
import { NotificationType } from './NotificationType'
import { NotificationDuration } from './NotificationDuration'
import { Participant } from 'livekit-client'
import { NotificationPayload } from './NotificationPayload'
import { RecordingMode } from '@/features/recording'

export const showLowerHandToast = (
  participant: Participant,
  onClose: () => void
) => {
  toastQueue.add(
    { participant, type: NotificationType.LowerHand },
    { timeout: NotificationDuration.LOWER_HAND, onClose }
  )
}

export const closeLowerHandToasts = () => {
  toastQueue.visibleToasts.forEach((toast) => {
    if (toast.content.type === NotificationType.LowerHand) {
      toastQueue.close(toast.key)
    }
  })
}

export const showChatMessageToast = (
  participant: Participant,
  message: string
) => {
  toastQueue.add(
    { participant, message, type: NotificationType.MessageReceived },
    { timeout: NotificationDuration.MESSAGE }
  )
}

export const showParticipantJoinedToast = (participant: Participant) => {
  toastQueue.add(
    { participant, type: NotificationType.ParticipantJoined },
    { timeout: NotificationDuration.PARTICIPANT_JOINED }
  )
}

export const showParticipantMutedToast = (participant: Participant) => {
  toastQueue.add(
    { participant, type: NotificationType.ParticipantMuted },
    { timeout: NotificationDuration.ALERT }
  )
}

export const showHandRaisedToast = (participant: Participant) => {
  toastQueue.add(
    { participant, type: NotificationType.HandRaised },
    { timeout: NotificationDuration.HAND_RAISED }
  )
}

export const showAlertToast = (
  type: NotificationType,
  participant?: Participant
) => {
  toastQueue.add({ participant, type }, { timeout: NotificationDuration.ALERT })
}

export const showRecordingRequestedToast = (
  type: NotificationType,
  participant?: Participant
) => {
  toastQueue.add(
    { participant, type },
    { timeout: NotificationDuration.RECORDING_REQUESTED }
  )
}

export const showPermissionsRemovedToast = (
  participant: Participant | undefined,
  removedSources: string[]
) => {
  toastQueue.add(
    { participant, type: NotificationType.PermissionsRemoved, removedSources },
    { timeout: NotificationDuration.ALERT }
  )
}

export const closeParticipantToasts = (participant: Participant) => {
  toastQueue.visibleToasts.forEach((toast) => {
    if (toast.content.participant === participant) {
      toastQueue.close(toast.key)
    }
  })
}

export const closeAllToasts = () => {
  toastQueue.visibleToasts.forEach(({ key }) => toastQueue.close(key))
}

export const findHandRaisedToast = (participant: Participant) => {
  return toastQueue.visibleToasts.find(
    (toast) =>
      toast.content.participant === participant &&
      toast.content.type === NotificationType.HandRaised
  )
}

export const notifyRecordingSaveInProgress = (
  mode: RecordingMode,
  participant: Participant
) => {
  toastQueue.add(
    { participant, mode, type: NotificationType.RecordingSaving },
    { timeout: NotificationDuration.RECORDING_SAVING }
  )
}

export const decodeNotificationDataReceived = (
  payload: Uint8Array
): NotificationPayload | undefined => {
  if (!payload || !(payload instanceof Uint8Array)) {
    throw new Error('Invalid payload: expected Uint8Array')
  }
  try {
    const decoder = new TextDecoder()
    const jsonString = decoder.decode(payload)
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Invalid decoded content')
    }
    return JSON.parse(jsonString) as NotificationPayload
  } catch (error) {
    console.error('Failed to decode notification payload:', error)
    return
  }
}

export const closeToastByKey = (key: string) => {
  toastQueue.close(key)
}
