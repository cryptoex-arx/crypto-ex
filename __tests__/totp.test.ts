import { sha1, toHex, utf8 } from '../src/utils/hash';
import {
  base32Decode,
  base32Encode,
  generateSecret,
  totp,
  verifyTotp,
} from '../src/utils/totp';

test('sha1 matches known digests', () => {
  expect(toHex(sha1(utf8('')))).toBe(
    'da39a3ee5e6b4b0d3255bfef95601890afd80709',
  );
  expect(toHex(sha1(utf8('abc')))).toBe(
    'a9993e364706816aba3e25717850c26c9cd0d89d',
  );
  // Spans two blocks.
  expect(toHex(sha1(utf8('a'.repeat(100))))).toBe(
    '7f9000257a4918d7072655ea468540cdcbd42e0c',
  );
});

test('totp matches the RFC 6238 SHA-1 vectors', () => {
  const key = utf8('12345678901234567890');
  expect(totp(key, 59_000, 8)).toBe('94287082');
  expect(totp(key, 1_111_111_109_000, 8)).toBe('07081804');
  expect(totp(key, 2_000_000_000_000, 8)).toBe('69279037');
});

test('base32 round-trips and verify accepts one step of drift', () => {
  const secret = generateSecret();
  expect(base32Encode(base32Decode(secret))).toBe(secret);

  const now = 1_700_000_000_000;
  expect(verifyTotp(secret, totp(secret, now), now)).toBe(true);
  expect(verifyTotp(secret, totp(secret, now - 30_000), now)).toBe(true);
  expect(verifyTotp(secret, totp(secret, now - 90_000), now)).toBe(false);
  expect(verifyTotp(secret, '12345', now)).toBe(false);
});
