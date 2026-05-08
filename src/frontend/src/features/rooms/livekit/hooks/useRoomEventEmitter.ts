import { useRoomContext } from '@livekit/components-react'
import type { Room } from 'livekit-client'

/** Facade hook: exposes the LiveKit Room narrowed to its event-emitter API. */
export const useRoomEventEmitter = (): Pick<Room, 'on' | 'off' | 'emit'> => {
  const room = useRoomContext()
  return room
}
