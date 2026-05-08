import { useRoomContext } from '@livekit/components-react'

/** Facade hook: exposes only the local participant from the LiveKit room. */
export const useLocalParticipant = () => {
  const room = useRoomContext()
  return room.localParticipant
}
