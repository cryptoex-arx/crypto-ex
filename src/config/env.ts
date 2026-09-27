import { API_BASE_URL, API_TIMEOUT_MS, APP_ENV } from '@env';

export type AppEnvironment = 'development' | 'production';

export interface AppConfig {
  environment: AppEnvironment;
  isDevelopment: boolean;
  /** Base URL of the backend API, without a trailing slash. Empty when unconfigured. */
  apiBaseUrl: string;
  apiTimeoutMs: number;
}

const DEFAULT_API_TIMEOUT_MS = 15_000;

function toEnvironment(value: string | undefined): AppEnvironment {
  return value === 'production' ? 'production' : 'development';
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}

function toBaseUrl(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

const environment = toEnvironment(APP_ENV);

/**
 * Single source of truth for environment-specific values.
 * Nothing outside this file should read from `@env` directly.
 */
export const config: AppConfig = {
  environment,
  isDevelopment: environment === 'development',
  apiBaseUrl: toBaseUrl(API_BASE_URL),
  apiTimeoutMs: toPositiveInt(API_TIMEOUT_MS, DEFAULT_API_TIMEOUT_MS),
};
