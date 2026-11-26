import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Finds this computer's address on whatever Wi-Fi you're on right now.
// Expo already knows it (it's the address your phone used to load the app),
// so nothing needs changing when you move between home and class.
function devServerHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    null;
  return hostUri ? String(hostUri).split(':')[0] : null;
}

// For a deployed site, set EXPO_PUBLIC_API_URL when you build, for example:
//   EXPO_PUBLIC_API_URL=https://your-server/api-host npx expo export -p web
// (no trailing slash). Otherwise the address is worked out automatically.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'web'
    ? 'http://localhost:3000'
    : `http://${devServerHost() ?? '10.0.2.2'}:3000`); // 10.0.2.2 = Android emulator fallback