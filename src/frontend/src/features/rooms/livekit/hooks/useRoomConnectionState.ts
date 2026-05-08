import { useRoomContext } from '@livekit/components-react'
import type { ConnectionState } from 'livekit-client'

/** Facade hook: exposes only the room's current connection state. */
export const useRoomConnectionState = (): ConnectionState => {
  const room = useRoomContext()
  return room.state
}
