import { config } from '../../config/env';
import type { RequestOptions } from '../../types/api';
import { logger } from '../../utils/logger';
import { ApiError, toApiError } from './errors';

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!config.apiBaseUrl) {
    throw new ApiError('config', 'API_BASE_URL is not configured');
  }
  return `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new ApiError('parse', 'Response was not valid JSON', {
      status: response.status,
      cause: error,
    });
  }
}

/**
 * Thin JSON transport over `fetch`: resolves the base URL, applies the
 * configured timeout and normalises every failure into an `ApiError`.
 *
 * Response payloads are cast to `T`; add runtime validation in the calling
 * service when a payload cannot be trusted.
 */
export async function request<T>(
  path: string,
  { method = 'GET', body, headers, signal }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeoutMs);
  const abortExternally = () => controller.abort();
  signal?.addEventListener('abort', abortExternally);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      throw new ApiError('http', `Request failed with ${response.status}`, {
        status: response.status,
      });
    }

    return await parseBody<T>(response);
  } catch (error) {
    const apiError = toApiError(error);
    logger.warn(`[api] ${method} ${path} failed: ${apiError.kind}`);
    throw apiError;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortExternally);
  }
}
