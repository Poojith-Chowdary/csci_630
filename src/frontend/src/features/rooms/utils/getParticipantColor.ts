import { Participant } from 'livekit-client'

const DEFAULT_COLOR = 'rgb(87, 44, 216)'

// Simplified HSL regex using named ranges for readability
const HSL_HUE = '(?:36[0]|3[0-5][0-9]|[12][0-9]{2}|[1-9][0-9]|[0-9])'
const HSL_SAT = '(?:7[0-5]|[5-6][0-9]|50)'
const HSL_LIT = '(?:60|[2-5][0-9])'
const HSL_REGEX = new RegExp(
  String.raw`^hsl\(${HSL_HUE},\s*${HSL_SAT}%,\s*${HSL_LIT}%\)$`
)

export const getParticipantColor = (participant: Participant): string => {
  const color = participant.attributes?.color
  if (!color) return DEFAULT_COLOR
  if (!HSL_REGEX.test(color)) {
    console.warn('Invalid color value:', color)
    return DEFAULT_COLOR
  }
  return color
}
