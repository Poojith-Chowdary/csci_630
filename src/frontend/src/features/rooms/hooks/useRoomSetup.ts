import { useEffect, useMemo, useState } from 'react'
import { Room, RoomOptions, VideoPresets } from 'livekit-client'
import { useConfig } from '@/api/useConfig'
import { isFireFox } from '@/utils/livekit'
import { LocalUserChoices } from '@/stores/userChoices'

/**
 * Facade hook that encapsulates LiveKit room construction and
 * connection warm-up logic, extracted from Conference component.
 * Reduces Conference.tsx from managing 7+ concerns to ~4.
 */
export const useRoomSetup = (userConfig: LocalUserChoices) => {
  const { data: apiConfig } = useConfig()
  const [isConnectionWarmedUp, setIsConnectionWarmedUp] = useState(false)

  const roomOptions = useMemo((): RoomOptions => {
    return {
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: { videoCodec: 'vp9' },
      videoCaptureDefaults: {
        deviceId: userConfig.videoDeviceId ?? undefined,
        resolution: userConfig.videoPublishResolution
          ? VideoPresets[userConfig.videoPublishResolution].resolution
          : undefined,
      },
      audioCaptureDefaults: {
        deviceId: userConfig.audioDeviceId ?? undefined,
      },
      audioOutput: {
        deviceId: userConfig.audioOutputDeviceId ?? undefined,
      },
    }
  }, [
    userConfig.videoDeviceId,
    userConfig.videoPublishResolution,
    userConfig.audioDeviceId,
    userConfig.audioOutputDeviceId,
  ])

  const room = useMemo(() => new Room(roomOptions), [roomOptions])

  const serverUrl = useMemo(() => {
    const livekit_url = apiConfig?.livekit.url
    if (!livekit_url) return
    if (apiConfig?.livekit.force_wss_protocol) {
      return livekit_url.replace('https://', 'wss://')
    }
    return livekit_url
  }, [apiConfig?.livekit])

  useEffect(() => {
    const prepareConnection = async () => {
      if (!apiConfig || isConnectionWarmedUp) return
      await room.prepareConnection(apiConfig.livekit.url)

      if (isFireFox() && apiConfig.livekit.enable_firefox_proxy_workaround) {
        try {
          const wssUrl =
            apiConfig.livekit.url
              .replace('https://', 'wss://')
              .replace(/\/$/, '') + '/rtc'
          const ws = new WebSocket(wssUrl)
          ws.onerror = () => ws.readyState <= 1 && ws.close()
        } catch (e) {
          console.debug('Firefox WebSocket workaround failed.', e)
        }
      }
      setIsConnectionWarmedUp(true)
    }
    prepareConnection()
  }, [room, apiConfig, isConnectionWarmedUp])

  return { room, serverUrl, isConnectionWarmedUp }
}
