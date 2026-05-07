import { useTranslation } from 'react-i18next'
import { RiShapesLine } from '@remixicon/react'
import { useSidePanel } from '../../hooks/useSidePanel'
import { ToggleButtonProps } from '@/primitives/ToggleButton'
import { PanelToggleButton } from './PanelToggleButton'

export const ToolsToggle = ({
  variant = 'primaryTextDark',
  onPress,
  ...props
}: ToggleButtonProps) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.tools' })
  const { isToolsOpen, toggleTools } = useSidePanel()
  const tooltipLabel = isToolsOpen ? 'open' : 'closed'

  return (
    <PanelToggleButton
      isSelected={isToolsOpen}
      onToggle={toggleTools}
      ariaLabel={t(tooltipLabel)}
      tooltip={t(tooltipLabel)}
      dataAttr="toggle-tools"
      icon={<RiShapesLine />}
      variant={variant}
      onPress={onPress}
      {...props}
    />
  )
}
