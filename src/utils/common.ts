import FingerprintScanner from 'react-native-fingerprint-scanner';
import { navTypes } from '../constants';
import { Platform, NativeModules, AsyncStorage } from 'react-native';

export async function checkTouchIDAvailiability(): Promise<{}> {
  let isSupported: Boolean = false;
  if (Platform.OS === 'android' && Platform.Version < 23) {
    isSupported = false;
  } else {
    try {
      const check = await FingerprintScanner.isSensorAvailable();
      isSupported = true;
    } catch (err) {
      isSupported = false
    }
  }
  return isSupported;
}

export const isRouteToCollapseApp = (currentRoute: string): boolean => {
  const forbiddenRoutes = [navTypes.HOME, navTypes.ACCOUNT_SELECT];
  if (forbiddenRoutes.indexOf(currentRoute) !== -1) {
    return true;
  } else {
    return false;
  }
}

export const getCurrentLocale = () => {
  let systemLanguage;
  if (Platform.OS === 'android') {
    systemLanguage = NativeModules.I18nManager.localeIdentifier.replace('_', '-');
  } else {
    systemLanguage = NativeModules.SettingsManager.settings.AppleLocale.replace('_', '-');
  }
  return systemLanguage;
}

export const uniqKeyGenerator = (payload: { key_id: string, ecosystem_id: string, role_id: string } ): string => {
  const { key_id, ecosystem_id, role_id } = payload;
  return `${key_id}_${ecosystem_id}_${role_id || 0}`;
}

export const TxDissect = (forsign: string) => {
  const matches = /([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}),[0-9]+,([0-9]+),(.*)/i.exec(forsign);

  if (matches) {
    return {
      requestID: matches[1],
      timestamp: parseInt(matches[2], 10),
      body: matches[3]
    };
  }
};

export function clearAsyncStorage() {
  AsyncStorage.getAllKeys().then(r => r.forEach(key => AsyncStorage.removeItem(key)));
}
