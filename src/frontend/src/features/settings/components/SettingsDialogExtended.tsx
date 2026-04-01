import { useRef } from "react";
import { Heading } from "react-aria-components";
import { useTranslation } from "react-i18next";
import {
  RiAccountCircleLine,
  RiEyeLine,
  RiNotification3Line,
  RiSettings3Line,
  RiSpeakerLine,
  RiVideoOnLine,
} from "@remixicon/react";

import { Dialog, type DialogProps } from "@/primitives";
import { Icon } from "@/primitives/Icon";
import { text } from "@/primitives/Text";
import { Tab, TabList, Tabs } from "@/primitives/Tabs";
import { css } from "@/styled-system/css";

import { useMediaQuery } from "@/features/rooms/livekit/hooks/useMediaQuery";
import { useIsAdminOrOwner } from "@/features/rooms/livekit/hooks/useIsAdminOrOwner";
import { SettingsDialogExtendedKey } from "@/features/settings/type";

import { AccountTab } from "./tabs/AccountTab";
import AccessibilityTab from "./tabs/AccessibilityTab";
import { AudioTab } from "./tabs/AudioTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { TranscriptionTab } from "./tabs/TranscriptionTab";
import { VideoTab } from "./tabs/VideoTab";

/**
 * Layout constants (single source of truth)
 * - Avoid rem/px mismatches by deriving breakpoint from modal width.
 */
const SETTINGS_DIALOG_WIDTH_REM = 50;
const SETTINGS_DIALOG_MAX_HEIGHT_REM = 40.625;
const SETTINGS_DIALOG_MARGIN_Y_REM = -1;
const SETTINGS_DIALOG_VIEWPORT_HEIGHT_OFFSET_REM = 2;

const WIDE_SCREEN_MIN_WIDTH_REM = SETTINGS_DIALOG_WIDTH_REM; // keep breakpoint consistent
const WIDE_SCREEN_MEDIA_QUERY = `(min-width: ${WIDE_SCREEN_MIN_WIDTH_REM}rem)`;

// spacing tokens
const TABLIST_PADDING_Y = "1rem";
const TABLIST_PADDING_RIGHT = "1.5rem";
const TABLIST_WIDE_PADDING_LEFT = "1rem";
const TABLIST_NARROW_PADDING_LEFT = "0.5rem";
const TAB_PANEL_MARGIN_TOP = "3.5rem";

const tabsStyle = css({
  maxHeight: `${SETTINGS_DIALOG_MAX_HEIGHT_REM}rem`,
  width: `${SETTINGS_DIALOG_WIDTH_REM}rem`,
  maxWidth: "100%",
  overflow: "hidden",
  marginY: `${SETTINGS_DIALOG_MARGIN_Y_REM}rem`,
  height: `calc(100vh - ${SETTINGS_DIALOG_VIEWPORT_HEIGHT_OFFSET_REM}rem)`,
});

const tabListContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  paddingY: TABLIST_PADDING_Y,
  paddingRight: TABLIST_PADDING_RIGHT,

  // Use theme-aware colors instead of hardcoded "lightGray"
  borderRightWidth: "1px",
  borderRightStyle: "solid",
  borderRightColor: { base: "gray.200", _dark: "gray.700" },
});

const tabListContainerWideStyle = css({
  paddingLeft: TABLIST_WIDE_PADDING_LEFT,
});

const tabListContainerNarrowStyle = css({
  paddingLeft: TABLIST_NARROW_PADDING_LEFT,
});

const tabPanelContainerStyle = css({
  display: "flex",
  flexGrow: "1",
  marginTop: TAB_PANEL_MARGIN_TOP,
  minWidth: 0,
});

export type SettingsDialogExtended = Pick<DialogProps, "isOpen" | "onOpenChange"> & {
  defaultSelectedTab?: SettingsDialogExtendedKey;
};

export const SettingsDialogExtended = (props: SettingsDialogExtended) => {
  const { t } = useTranslation("settings");
  const dialogEl = useRef(null);

  // Wide screen => labels visible. Narrow => icon-only tab list.
  const isWideScreen = useMediaQuery(WIDE_SCREEN_MEDIA_QUERY);

  const isAdminOrOwner = useIsAdminOrOwner();

  const tabListStyle = `${tabListContainerStyle} ${isWideScreen ? tabListContainerWideStyle : tabListContainerNarrowStyle
    }`;

  const tabLabel = (key: SettingsDialogExtendedKey) =>
    isWideScreen ? t(`tabs.${key}`) : null;

  return (
    <Dialog
      {...props}
      ref={dialogEl}
      aria-label={t("dialog.heading")}
      className={tabsStyle}
    >
      <Tabs defaultSelectedKey={props.defaultSelectedTab}>
        <Heading
          slot="title"
          className={text({ size: "lg", weight: "bold" })}
        >
          {isWideScreen && t("dialog.heading")}
        </Heading>

        <div className={css({ display: "flex", height: "100%" })}>
          <div className={tabListStyle}>
            <TabList border={false}>
              <Tab isIconOnly value={SettingsDialogExtendedKey.ACCOUNT}>
                <Icon>
                  <RiAccountCircleLine />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.ACCOUNT)}
              </Tab>

              <Tab isIconOnly value={SettingsDialogExtendedKey.AUDIO}>
                <Icon>
                  <RiSpeakerLine />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.AUDIO)}
              </Tab>

              <Tab isIconOnly value={SettingsDialogExtendedKey.VIDEO}>
                <Icon>
                  <RiVideoOnLine />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.VIDEO)}
              </Tab>

              <Tab isIconOnly value={SettingsDialogExtendedKey.GENERAL}>
                <Icon>
                  <RiSettings3Line />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.GENERAL)}
              </Tab>

              <Tab isIconOnly value={SettingsDialogExtendedKey.NOTIFICATIONS}>
                <Icon>
                  <RiNotification3Line />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.NOTIFICATIONS)}
              </Tab>

              {isAdminOrOwner && (
                <Tab isIconOnly value={SettingsDialogExtendedKey.TRANSCRIPTION}>
                  <Icon>
                    <RiSettings3Line />
                  </Icon>
                  {tabLabel(SettingsDialogExtendedKey.TRANSCRIPTION)}
                </Tab>
              )}

              <Tab isIconOnly value={SettingsDialogExtendedKey.ACCESSIBILITY}>
                <Icon>
                  <RiEyeLine />
                </Icon>
                {tabLabel(SettingsDialogExtendedKey.ACCESSIBILITY)}
              </Tab>
            </TabList>
          </div>

          <div className={tabPanelContainerStyle}>
            <AccountTab />
            <AudioTab />
            <VideoTab />
            <GeneralTab />
            <NotificationsTab />
            {/* Transcription tab won't be accessible if the tab is not active in the tab list */}
            {isAdminOrOwner && <TranscriptionTab />}
            <AccessibilityTab />
          </div>
        </div>
      </Tabs>
    </Dialog>
  );
};