/**
 * User-facing copy for failure states. Technical details stay in the logs;
 * these strings are what the UI is allowed to show.
 */
export const ERROR_MESSAGES = {
  network: 'No internet connection. Check your network and try again.',
  timeout: 'The request took too long. Please try again.',
  server: 'Something went wrong on our side. Please try again later.',
  notFound: 'We could not find what you were looking for.',
  unauthorized: 'Your session has expired. Please sign in again.',
  unknown: 'Something went wrong. Please try again.',
} as const;

export const EMPTY_STATE_MESSAGE = 'There is nothing here yet.';
