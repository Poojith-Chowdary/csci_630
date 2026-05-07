import { css } from '@/styled-system/css'
import { ToggleButton } from '@/primitives'
import { ToggleButtonProps } from '@/primitives/ToggleButton'
import { ButtonRecipeProps } from '@/primitives/buttonRecipe'
import { ReactNode } from 'react'

export type PanelToggleButtonProps = {
  isSelected: boolean
  onToggle: () => void
  ariaLabel: string
  tooltip: string
  dataAttr: string
  icon: ReactNode
  variant?: NonNullable<ButtonRecipeProps>['variant']
  isDisabled?: boolean
  badge?: ReactNode
  onPress?: ToggleButtonProps['onPress']
}

export const PanelToggleButton = ({
  isSelected,
  onToggle,
  ariaLabel,
  tooltip,
  dataAttr,
  icon,
  variant = 'primaryTextDark',
  isDisabled,
  badge,
  onPress,
  ...props
}: PanelToggleButtonProps) => {
  return (
    <div
      className={css({
        position: 'relative',
        display: 'inline-block',
      })}
    >
      <ToggleButton
        square
        variant={variant}
        aria-label={ariaLabel}
        tooltip={tooltip}
        isSelected={isSelected}
        isDisabled={isDisabled}
        onPress={(e) => {
          onToggle()
          onPress?.(e)
        }}
        data-attr={dataAttr}
        {...props}
      >
        {icon}
      </ToggleButton>
      {badge}
    </div>
  )
}
