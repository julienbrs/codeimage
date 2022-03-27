import {createTheme} from '@vanilla-extract/css';
import {colors} from './theme.css';
import {themeVars} from './global.css';

const palette = {
  systemDarkGray1: '#333333',
  systemDarkGray2: '#2B2B2B',
  systemDarkGray3: '#282828',
  systemDarkGray4: '#252525',
  systemDarkGray5: '#232323',
  systemDarkGray6: '#1d1d1d',
  systemDarkGray7: '#181818',
  systemDarkGray8: '#161515',
  systemDarkGray9: '#111111',
  white: '#FFFFFF',
} as const;

export const darkThemeCss = createTheme(colors, {
  primary: themeVars.backgroundColor.blue['400'],
  background: '#181818',
  baseText: themeVars.textColor.gray['800'],
  descriptionTextColor: '#999999',
  secondary: themeVars.backgroundColor.gray['200'],
  divider: '#252525',

  panel: {
    background: palette.systemDarkGray9,
    textColor: palette.white,
  },

  input: {
    backgroundColor: '#2b2b2b',
    borderColor: '#252525',
    textColor: '#EEEEEE',
    labelTextColor: '#FFFFFF',
    labelTextHintColor: '#999999',
    accentColor: '#555555',
  },

  buttonBackgroundColor: '#333333',
  buttonBackgroundActive: '#232323',
  buttonBackgroundHover: '#282828',
  buttonTextColor: themeVars.backgroundColor.white,
  buttonBackgroundPrimaryColor: themeVars.backgroundColor.blue['500'],
  buttonBackgroundPrimaryHover: themeVars.backgroundColor.blue['600'],
  buttonBackgroundPrimaryActive: themeVars.backgroundColor.blue['700'],
  buttonTextPrimaryColor: themeVars.backgroundColor.white,
  menuBackground: '#2b2b2b',
  resizeLineBackgroundColor: 'hsla(0,0%,100%,.25)',
  resizeLineBadgeBackgroundColor: '#161515',
  listBoxPanelBackground: '#2B2B2B',
  listBoxActiveBackgroundColor: themeVars.backgroundColor.blue['500'],
  listBoxHoverBackgroundColor: `#232323`,
  listBoxTextColor: themeVars.backgroundColor.white,
  listBoxActiveTextColor: themeVars.backgroundColor.white,
  scrollBarBackgroundColor: '#555555',
  scrollBarHoverBackgroundColor: '#333333',
  bottomBarBackgroundColor: '#2B2B2B',
  bottomBarTextColor: '#EEEEEE',
  emptySquareBackgroundColor: '#252525',
  snackbarBackgroundColor: '#EEEEEE',
  snackbarTextColor: themeVars.textColor.gray['800'],
  frameDragControlBackgroundColor: `#EEEEEE`,
  dialogOverlayBackgroundColor: 'rgba(0,0,0,.7)',
  dialogPanelBackgroundColor: '#1d1d1d',
  dialogPanelShadow:
    '0px 10px 30px 0px rgba(0,0,0,.15),inset 0 0 0 1px #222222',
  dialogTitleTextColor: '#EEEEEE',
  dialogTitleBorderColor: '#2B2B2B',
  dialogPanelTextColor: '#EEEEEE',
  shortcutKeyBackgroundColor: '#555555',
});
