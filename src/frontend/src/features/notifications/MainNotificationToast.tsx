import { useEffect, useRef, useState } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RemoteParticipant, RoomEvent } from 'livekit-client'
import { ChatMessage, isMobileBrowser } from '@livekit/components-core'
import { useTranslation } from 'react-i18next'
import { Div } from '@/primitives'
import { NotificationType } from './NotificationType'
import {
  decodeNotificationDataReceived,
  showChatMessageToast,
  showParticipantJoinedToast,
  showParticipantMutedToast,
  showHandRaisedToast,
  showAlertToast,
  showRecordingRequestedToast,
  showPermissionsRemovedToast,
  closeParticipantToasts,
  closeAllToasts,
  closeToastByKey,
  findHandRaisedToast,
} from './utils'
import { useNotificationSound } from '@/features/notifications/hooks/useSoundNotification'
import { ToastProvider } from './components/ToastProvider'
import { WaitingParticipantNotification } from './components/WaitingParticipantNotification'
import {
  Emoji,
  Reaction,
} from '@/features/rooms/livekit/components/controls/ReactionsToggle'
import {
  ANIMATION_DURATION,
  ReactionPortals,
} from '@/features/rooms/livekit/components/ReactionPortal'

export const MainNotificationToast = () => {
  const room = useRoomContext()
  const { triggerNotificationSound } = useNotificationSound()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const instanceIdRef = useRef(0)

  useEffect(() => {
    const handleChatMessage = (
      chatMessage: ChatMessage,
      participant?: Participant
    ) => {
      if (!participant || participant.isLocal) return
      triggerNotificationSound(NotificationType.MessageReceived)
      showChatMessageToast(participant, chatMessage.message)
    }
    room.on(RoomEvent.ChatMessage, handleChatMessage)
    return () => {
      room.off(RoomEvent.ChatMessage, handleChatMessage)
    }
  }, [room, triggerNotificationSound])

  const handleEmoji = (emoji: string, participant: Participant) => {
    if (!emoji || !Object.values(Emoji).includes(emoji as Emoji)) return
    const id = instanceIdRef.current++
    setReactions((prev) => [...prev, { id, emoji, participant }])
    setTimeout(() => {
      setReactions((prev) => prev.filter((instance) => instance.id !== id))
    }, ANIMATION_DURATION)
  }

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      const notification = decodeNotificationDataReceived(payload)
      if (!notification) return

      switch (notification.type) {
        case NotificationType.ParticipantMuted:
          if (participant) showParticipantMutedToast(participant)
          break
        case NotificationType.ReactionReceived:
          if (notification.data?.emoji && participant)
            handleEmoji(notification.data.emoji, participant)
          break
        case NotificationType.TranscriptionStarted:
        case NotificationType.TranscriptionStopped:
        case NotificationType.ScreenRecordingStarted:
        case NotificationType.ScreenRecordingStopped:
        case NotificationType.TranscriptionLimitReached:
        case NotificationType.ScreenRecordingLimitReached:
          showAlertToast(notification.type, participant)
          break
        case NotificationType.TranscriptionRequested:
        case NotificationType.ScreenRecordingRequested:
          showRecordingRequestedToast(notification.type, participant)
          break
        case NotificationType.PermissionsRemoved: {
          const removedSources = notification?.data?.removedSources
          if (!removedSources?.length) break
          showPermissionsRemovedToast(participant, removedSources)
          break
        }
        default:
          return
      }
    }
    room.on(RoomEvent.DataReceived, handleDataReceived)
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  useEffect(() => {
    const handleParticipantJoined = (participant: Participant) => {
      if (isMobileBrowser()) return
      triggerNotificationSound(NotificationType.ParticipantJoined)
      showParticipantJoinedToast(participant)
    }
    room.on(RoomEvent.ParticipantConnected, handleParticipantJoined)
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantJoined)
    }
  }, [room, triggerNotificationSound])

  useEffect(() => {
    room.on(RoomEvent.ParticipantDisconnected, closeParticipantToasts)
    return () => {
      room.off(RoomEvent.ParticipantDisconnected, closeParticipantToasts)
    }
  }, [room])

  useEffect(() => {
    const handleHandRaise = (
      changedAttributes: Record<string, string>,
      participant: Participant
    ) => {
      if (!participant || isMobileBrowser() || participant.isLocal) return
      if (!('handRaisedAt' in changedAttributes)) return

      const existingToast = findHandRaisedToast(participant)

      if (existingToast && !changedAttributes?.handRaisedAt) {
        closeToastByKey(existingToast.key)
        return
      }
      if (!existingToast && !!changedAttributes?.handRaisedAt) {
        triggerNotificationSound(NotificationType.HandRaised)
        showHandRaisedToast(participant)
      }
    }
    room.on(RoomEvent.ParticipantAttributesChanged, handleHandRaise)
    return () => {
      room.off(RoomEvent.ParticipantAttributesChanged, handleHandRaise)
    }
  }, [room, triggerNotificationSound])

  useEffect(() => {
    room.on(RoomEvent.Disconnected, closeAllToasts)
    return () => {
      room.off(RoomEvent.Disconnected, closeAllToasts)
    }
  }, [room])

  useTranslation(['notifications'])

  return (
    <Div position="absolute" bottom={0} right={5} zIndex={1000}>
      <ToastProvider />
      <WaitingParticipantNotification />
      <ReactionPortals reactions={reactions} />
    </Div>
  )
}
