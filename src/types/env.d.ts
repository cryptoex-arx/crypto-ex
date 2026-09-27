/**
 * Values injected at build time by `react-native-dotenv` (see babel.config.js).
 * They are typed as possibly undefined because a machine may not have every
 * key present in its .env file — src/config/env.ts applies the defaults.
 */
declare module '@env' {
  export const APP_ENV: string | undefined;
  export const API_BASE_URL: string | undefined;
  export const API_TIMEOUT_MS: string | undefined;
}
