/* eslint-disable no-bitwise -- hashing is bit arithmetic by definition. */
import { hmacSha1 } from './hash';

/** RFC 4648 alphabet used by authenticator apps for shared secrets. */
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(text: string): Uint8Array {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

/** A new random shared secret, base32 encoded. */
export function generateSecret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return base32Encode(bytes);
}

function hotp(key: Uint8Array, counter: number, digits: number): string {
  const message = new Uint8Array(8);
  const view = new DataView(message.buffer);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const hash = hmacSha1(key, message);
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    (hash[offset + 1] << 16) |
    (hash[offset + 2] << 8) |
    hash[offset + 3];
  return String(binary % 10 ** digits).padStart(digits, '0');
}

/** The code an authenticator app shows for `secret` at `timeMs`. */
export function totp(
  secret: string | Uint8Array,
  timeMs = Date.now(),
  digits = DIGITS,
): string {
  const key = typeof secret === 'string' ? base32Decode(secret) : secret;
  return hotp(key, Math.floor(timeMs / 1000 / STEP_SECONDS), digits);
}

/** Accepts the current code and one step either side for clock drift. */
export function verifyTotp(
  secret: string,
  code: string,
  timeMs = Date.now(),
): boolean {
  if (!/^\d{6}$/.test(code)) {
    return false;
  }
  return [-1, 0, 1].some(
    drift => totp(secret, timeMs + drift * STEP_SECONDS * 1000) === code,
  );
}

/** The `otpauth://` link authenticator apps read from a QR code. */
export function otpauthUrl(
  secret: string,
  account: string,
  issuer: string,
): string {
  const label = encodeURIComponent(issuer + ':' + account);
  return (
    'otpauth://totp/' +
    label +
    '?secret=' +
    secret +
    '&issuer=' +
    encodeURIComponent(issuer)
  );
}
