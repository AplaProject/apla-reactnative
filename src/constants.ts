import { Platform } from 'react-native';

export const URL_PREFIX = Platform.OS === 'android' ? 'apla://apla/' : 'apla://';

export const DEFAULT_PAGE = 'default_page';
export const DEFAULT_TITLE = 'Home';


export const NAV = {
  AUTH: 'AUTH',
  MAIN: 'MAIN'
}

export const navTypes = {
  AUTH: `${NAV.AUTH}/HOME`,
  SCANNER: `${NAV.AUTH}/SCANNER`,
  SIGN_IN: `${NAV.AUTH}/SIGN_IN`,
  IMPORT_ACCOUNT: `${NAV.AUTH}/IMPORT_ACCOUNT`,
  SIGN_UP_CONFIRM: `${NAV.AUTH}/SIGN_UP_CONFIRM`,
  SIGN_UP_WARNING: `${NAV.AUTH}/SIGN_UP_WARNING`,
  SIGN_UP: `${NAV.AUTH}/SIGN_UP`,
  AUTH_SUCCESSFUL: `${NAV.AUTH}/AUTH_SUCCESSFUL`,
  ACCOUNT_SELECT: `${NAV.AUTH}/ACCOUNT_SELECT`,
  HOME: `${NAV.MAIN}/HOME`,
  SUB_MENU: `${NAV.MAIN}/SUB_MENU`,
  PAGE: `${NAV.MAIN}/PAGE`,
  KEY: `${NAV.MAIN}/KEY`,
  TRANSACTIONS: `${NAV.MAIN}/TRANSACTIONS`,
  LANDING: `LANDING`,
  NOTIFICATIONS: `${NAV.MAIN}/NOTIFICATIONS`,
};

export const ModalTypes = {
  PASSWORD: 'PASSWORD_MODAL',
  CONTRACT: 'CONTRACT_MODAL',
  NOTIFICATIONS_PAGE: 'NOTIFICATIONS_PAGE_MODAL',
}