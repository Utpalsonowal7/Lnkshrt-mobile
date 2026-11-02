// EXPO_PUBLIC variables are embedded in the app. Never put secrets here.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://l.utpx.in/api/v1').replace(/\/+$/, '');
export const SHORT_URL = (process.env.EXPO_PUBLIC_SHORT_URL || 'https://l.utpx.in').replace(/\/+$/, '');
export const ENABLE_DEMO = process.env.EXPO_PUBLIC_ENABLE_DEMO !== 'false';
