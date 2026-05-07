import { useTranslation } from 'react-i18next'
import { RiChat1Line } from '@remixicon/react'
import { useSnapshot } from 'valtio'
import { css } from '@/styled-system/css'
import { chatStore } from '@/stores/chat'
import { useSidePanel } from '../../hooks/useSidePanel'
import { ToggleButtonProps } from '@/primitives/ToggleButton'
import { PanelToggleButton } from './PanelToggleButton'

export const ChatToggle = ({
  onPress,
  ...props
}: Partial<ToggleButtonProps>) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.chat' })
  const chatSnap = useSnapshot(chatStore)
  const { isChatOpen, toggleChat } = useSidePanel()
  const tooltipLabel = isChatOpen ? 'open' : 'closed'

  const badge = chatSnap.unreadMessages ? (
    <div
      className={css({
        position: 'absolute',
        top: '-.25rem',
        right: '-.25rem',
        width: '1rem',
        height: '1rem',
        backgroundColor: 'alert.notification',
        borderRadius: '50%',
        zIndex: 1,
        border: '2px solid',
        borderColor: 'greyscale.250',
      })}
    />
  ) : undefined

  return (
    <PanelToggleButton
      isSelected={isChatOpen}
      onToggle={toggleChat}
      ariaLabel={t(tooltipLabel)}
      tooltip={t(tooltipLabel)}
      dataAttr={`controls-chat-${tooltipLabel}`}
      icon={<RiChat1Line />}
      badge={badge}
      onPress={onPress}
      {...props}
    />
  )
}
