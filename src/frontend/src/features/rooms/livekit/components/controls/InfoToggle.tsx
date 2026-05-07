import { useTranslation } from 'react-i18next'
import { RiInformationLine } from '@remixicon/react'
import { useSidePanel } from '../../hooks/useSidePanel'
import { ToggleButtonProps } from '@/primitives/ToggleButton'
import { PanelToggleButton } from './PanelToggleButton'

export const InfoToggle = ({
  onPress,
  ...props
}: Partial<ToggleButtonProps>) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.info' })
  const { isInfoOpen, toggleInfo } = useSidePanel()
  const tooltipLabel = isInfoOpen ? 'open' : 'closed'

  return (
    <PanelToggleButton
      isSelected={isInfoOpen}
      onToggle={toggleInfo}
      ariaLabel={t(tooltipLabel)}
      tooltip={t(tooltipLabel)}
      dataAttr={`controls-info-${tooltipLabel}`}
      icon={<RiInformationLine />}
      onPress={onPress}
      {...props}
    />
  )
}
