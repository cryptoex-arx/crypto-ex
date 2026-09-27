/* eslint-disable no-console */
import { config } from '../config/env';

/**
 * Central logging entry point.
 *
 * Debug output is development-only so nothing leaks into production builds;
 * never pass credentials, tokens or request bodies to these functions.
 */
export const logger = {
  debug(message: string, ...details: unknown[]): void {
    if (config.isDevelopment) {
      console.log(message, ...details);
    }
  },
  warn(message: string, ...details: unknown[]): void {
    if (config.isDevelopment) {
      console.warn(message, ...details);
    }
  },
  error(message: string, ...details: unknown[]): void {
    console.error(message, ...details);
  },
};
