import { Platform } from 'react-native';

const androidEmulatorHost = 'http://10.0.2.2:4000';
const iosSimulatorHost = 'http://localhost:4000';
const envHost =
  process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim().length
    ? process.env.EXPO_PUBLIC_API_URL.trim()
    : null;

export const API_BASE_URL =
  envHost ??
  (Platform.OS === 'android' ? androidEmulatorHost : iosSimulatorHost);
