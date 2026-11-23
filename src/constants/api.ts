import { Platform } from 'react-native';

// Phones can't reach "localhost" on your computer. For a real phone, put your
// computer's Wi-Fi IP here (run `ipconfig` on Windows and look for the
// "IPv4 Address", e.g. 192.168.1.23). Phone and computer must be on the same Wi-Fi.
const LAN_IP = '10.0.0.18';

// Android emulator only: use 10.0.2.2 instead of LAN_IP.
export const API_URL =
  Platform.OS === 'web' ? 'http://localhost:3000' : `http://${LAN_IP}:3000`;