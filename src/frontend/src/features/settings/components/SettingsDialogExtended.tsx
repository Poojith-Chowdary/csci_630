import { useRef } from 'react'
import { Heading } from 'react-aria-components'
import {
  RiAccountCircleLine,
  RiEyeLine,
  RiNotification3Line,
  RiSettings3Line,
  RiSpeakerLine,
  RiVideoOnLine,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'

import { Dialog, type DialogProps } from '@/primitives'
import { Icon } from '@/primitives/Icon'
import { text } from '@/primitives/Text'
import { Tab, TabList, Tabs } from '@/primitives/Tabs'
import { css } from '@/styled-system/css'

import { useMediaQuery } from '@/features/rooms/livekit/hooks/useMediaQuery'
import { useIsAdminOrOwner } from '@/features/rooms/livekit/hooks/useIsAdminOrOwner'
import { SettingsDialogExtendedKey } from '@/features/settings/type'

import AccessibilityTab from './tabs/AccessibilityTab'
import { AccountTab } from './tabs/AccountTab'
import { AudioTab } from './tabs/AudioTab'
import { GeneralTab } from './tabs/GeneralTab'
import { NotificationsTab } from './tabs/NotificationsTab'
import { TranscriptionTab } from './tabs/TranscriptionTab'
import { VideoTab } from './tabs/VideoTab'

/**
 * Layout constants (single source of truth)
 * - Replaces “fixme” magic numbers with named constants.
 * - Keeps existing behavior while making values easy to audit/change.
 */
const DIALOG_WIDTH_REM = 50
const DIALOG_MAX_HEIGHT_REM = 40.625
const DIALOG_MARGIN_Y_REM = -1
const VIEWPORT_OFFSET_REM = 2

const WIDE_BREAKPOINT_REM = DIALOG_WIDTH_REM
const WIDE_MEDIA_QUERY = `(min-width: ${WIDE_BREAKPOINT_REM}rem)`

const TABLIST_PADDING_Y_REM = 1
const TABLIST_PADDING_RIGHT_REM = 1.5
const TABLIST_PADDING_LEFT_WIDE_REM = 1
const TABLIST_PADDING_LEFT_NARROW_REM = 0.5

const TAB_PANEL_MARGIN_TOP_REM = 3.5

const dialogStyle = css({
  maxHeight: `${DIALOG_MAX_HEIGHT_REM}rem`,
  width: `${DIALOG_WIDTH_REM}rem`,
  maxWidth: '100%',
  overflow: 'hidden',
  marginY: `${DIALOG_MARGIN_Y_REM}rem`,
  height: `calc(100vh - ${VIEWPORT_OFFSET_REM}rem)`,
})

const tabListBaseStyle = css({
  display: 'flex',
  flexDirection: 'column',
  paddingY: `${TABLIST_PADDING_Y_REM}rem`,
  paddingRight: `${TABLIST_PADDING_RIGHT_REM}rem`,
  borderRightWidth: '1px',
  borderRightStyle: 'solid',
  borderRightColor: { base: 'gray.200', _dark: 'gray.700' },
})

const tabListWideStyle = css({
  paddingLeft: `${TABLIST_PADDING_LEFT_WIDE_REM}rem`,
})

const tabListNarrowStyle = css({
  paddingLeft: `${TABLIST_PADDING_LEFT_NARROW_REM}rem`,
})

const tabPanelContainerStyle = css({
  display: 'flex',
  flexGrow: 1,
  marginTop: `${TAB_PANEL_MARGIN_TOP_REM}rem`,
  minWidth: 0,
})

export type SettingsDialogExtended = Pick<
  DialogProps,
  'isOpen' | 'onOpenChange'
> & {
  defaultSelectedTab?: SettingsDialogExtendedKey
}

export const SettingsDialogExtended = (props: SettingsDialogExtended) => {
  const { t } = useTranslation('settings')
  const dialogEl = useRef<null>(null)

  const isWideScreen = useMediaQuery(WIDE_MEDIA_QUERY)
  const isAdminOrOwner = useIsAdminOrOwner()

  const tabListStyle = `${tabListBaseStyle} ${
    isWideScreen ? tabListWideStyle : tabListNarrowStyle
  }`

  const maybeLabel = (key: SettingsDialogExtendedKey) =>
    isWideScreen ? t(`tabs.${key}`) : null

  return (
    <Dialog
      {...props}
      innerRef={dialogEl}
      aria-label={t('dialog.heading')}
      className={dialogStyle}
    >
      <Tabs defaultSelectedKey={props.defaultSelectedTab}>
        <Heading
          slot="title"
          className={text({ variant: 'h3'})}
        >
          {isWideScreen && t('dialog.heading')}
        </Heading>

        <div className={css({ display: 'flex', height: '100%' })}>
          <div className={tabListStyle}>
            <TabList border={false}>
              <Tab icon id={SettingsDialogExtendedKey.ACCOUNT}>
                <Icon name="account">
                  <RiAccountCircleLine />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.ACCOUNT)}
              </Tab>

              <Tab icon id={SettingsDialogExtendedKey.AUDIO}>
                <Icon name="audio">
                  <RiSpeakerLine />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.AUDIO)}
              </Tab>

              <Tab icon id={SettingsDialogExtendedKey.VIDEO}>
                <Icon name="video">
                  <RiVideoOnLine />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.VIDEO)}
              </Tab>

              <Tab icon id={SettingsDialogExtendedKey.GENERAL}>
                <Icon name="general">
                  <RiSettings3Line />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.GENERAL)}
              </Tab>

              <Tab icon id={SettingsDialogExtendedKey.NOTIFICATIONS}>
                <Icon name="notifications">
                  <RiNotification3Line />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.NOTIFICATIONS)}
              </Tab>

              {isAdminOrOwner && (
                <Tab icon id={SettingsDialogExtendedKey.TRANSCRIPTION}>
                  <Icon name="transcription">
                    <RiSettings3Line />
                  </Icon>
                  {maybeLabel(SettingsDialogExtendedKey.TRANSCRIPTION)}
                </Tab>
              )}

              <Tab icon id={SettingsDialogExtendedKey.ACCESSIBILITY}>
                <Icon name="accessibility">
                  <RiEyeLine />
                </Icon>
                {maybeLabel(SettingsDialogExtendedKey.ACCESSIBILITY)}
              </Tab>
            </TabList>
          </div>

          <div className={tabPanelContainerStyle}>
            <AccountTab />
            <AudioTab />
            <VideoTab />
            <GeneralTab />
            <NotificationsTab />
            {isAdminOrOwner && <TranscriptionTab />}
            <AccessibilityTab />
          </div>
        </div>
      </Tabs>
    </Dialog>
  )
}
