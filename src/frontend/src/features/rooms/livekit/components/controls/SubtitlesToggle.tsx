import { useTranslation } from 'react-i18next'
import { RiClosedCaptioningLine } from '@remixicon/react'
import { useSubtitles } from '@/features/subtitle/hooks/useSubtitles'
import { useAreSubtitlesAvailable } from '@/features/subtitle/hooks/useAreSubtitlesAvailable'
import { PanelToggleButton } from './PanelToggleButton'

export const SubtitlesToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.subtitles' })
  const { areSubtitlesOpen, toggleSubtitles, areSubtitlesPending } =
    useSubtitles()
  const areSubtitlesAvailable = useAreSubtitlesAvailable()
  const tooltipLabel = areSubtitlesOpen ? 'open' : 'closed'

  if (!areSubtitlesAvailable) return null

  return (
    <PanelToggleButton
      isSelected={areSubtitlesOpen}
      onToggle={toggleSubtitles}
      ariaLabel={t(tooltipLabel)}
      tooltip={t(tooltipLabel)}
      dataAttr={`controls-subtitles-${tooltipLabel}`}
      icon={<RiClosedCaptioningLine />}
      variant="primaryDark"
      isDisabled={areSubtitlesPending}
    />
  )
}
