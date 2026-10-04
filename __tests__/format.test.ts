import {
  formatInr,
  formatPercent,
  formatUsdCompact,
} from '../src/utils/format';

test('formatInr compact matches the list-row styles', () => {
  expect(formatInr(7_478_000)).toBe('₹74.78L');
  expect(formatInr(235_000)).toBe('₹2.35L');
  expect(formatInr(12_500_000)).toBe('₹1.25Cr');
  expect(formatInr(13_240)).toBe('₹13,240');
  expect(formatInr(8.14)).toBe('₹8.14');
});

test('formatInr full uses Indian grouping with paise', () => {
  expect(formatInr(7_478_000, 'full')).toBe('₹74,78,000.00');
  expect(formatInr(19.3, 'full')).toBe('₹19.30');
});

test('formatUsdCompact picks the suffix by magnitude', () => {
  expect(formatUsdCompact(164_000_000)).toBe('$164M');
  expect(formatUsdCompact(367_000)).toBe('$367K');
  expect(formatUsdCompact(2_000_000_000)).toBe('$2B');
});

test('formatPercent signs non-zero values only', () => {
  expect(formatPercent(0.56)).toBe('+0.56%');
  expect(formatPercent(-1.02)).toBe('-1.02%');
  expect(formatPercent(-0.001)).toBe('0.00%');
});
