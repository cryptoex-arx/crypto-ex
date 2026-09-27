import { ERROR_MESSAGES } from '../../constants/messages';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'http'
  | 'parse'
  | 'config'
  | 'unknown';

/**
 * Normalised transport/API failure. `message` is developer-facing —
 * use `getUserMessage` for anything rendered to a user.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  /** Original failure, kept for logging only. */
  readonly cause?: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

/** Converts anything thrown by the transport layer into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new ApiError('timeout', 'Request aborted', { cause: error });
    }
    return new ApiError('network', error.message, { cause: error });
  }

  return new ApiError('unknown', 'Unknown request failure', { cause: error });
}

/** Maps a failure to copy that is safe to show to a user. */
export function getUserMessage(error: unknown): string {
  const apiError = toApiError(error);

  switch (apiError.kind) {
    case 'network':
      return ERROR_MESSAGES.network;
    case 'timeout':
      return ERROR_MESSAGES.timeout;
    case 'http':
      if (apiError.status === 401 || apiError.status === 403) {
        return ERROR_MESSAGES.unauthorized;
      }
      if (apiError.status === 404) {
        return ERROR_MESSAGES.notFound;
      }
      if (apiError.status !== undefined && apiError.status >= 500) {
        return ERROR_MESSAGES.server;
      }
      return ERROR_MESSAGES.unknown;
    case 'parse':
    case 'config':
    case 'unknown':
      return ERROR_MESSAGES.unknown;
  }
}
