import { useRoomContext } from '@livekit/components-react'

/** Facade hook: exposes room-level actions without leaking the full Room object. */
export const useRoomConnectionActions = () => {
  const room = useRoomContext()
  return {
    disconnect: (stopTracks?: boolean) => room.disconnect(stopTracks),
    setLocalParticipantName: (name: string) =>
      room.localParticipant.setName(name),
    localParticipantName: room.localParticipant.name,
  }
}
