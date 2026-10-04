/**
 * Display formatting for market numbers. Values stay numeric everywhere else;
 * only the UI turns them into strings.
 */

const LAKH = 100_000;
const CRORE = 10_000_000;

/**
 * INR price. `compact` abbreviates large values the way list rows show them
 * (`₹74.78L`, `₹13,240`, `₹8.14`); `full` shows every digit with paise.
 */
export function formatInr(
  value: number,
  style: 'compact' | 'full' = 'compact',
): string {
  if (style === 'full') {
    return (
      '₹' +
      value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  if (value >= CRORE) {
    return '₹' + (value / CRORE).toFixed(2) + 'Cr';
  }
  if (value >= LAKH) {
    return '₹' + (value / LAKH).toFixed(2) + 'L';
  }
  if (value >= 1000) {
    return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
  return '₹' + value.toFixed(2);
}

/** Whole-unit USD amount with a K/M/B suffix, e.g. `$164M`. */
export function formatUsdCompact(value: number): string {
  if (value >= 1e9) {
    return '$' + Math.round(value / 1e9) + 'B';
  }
  if (value >= 1e6) {
    return '$' + Math.round(value / 1e6) + 'M';
  }
  if (value >= 1e3) {
    return '$' + Math.round(value / 1e3) + 'K';
  }
  return '$' + Math.round(value);
}

/** Signed percentage with two decimals, e.g. `+0.56%`. Zero has no sign. */
export function formatPercent(value: number): string {
  const digits = Math.abs(value).toFixed(2);
  if (digits === '0.00') {
    return digits + '%';
  }
  return (value > 0 ? '+' : '-') + digits + '%';
}

/** Decimal places a quantity of a coin trading at `priceInr` needs. */
export function quantityDecimals(priceInr: number): number {
  if (priceInr >= 100_000) {
    return 6;
  }
  if (priceInr >= 1_000) {
    return 4;
  }
  if (priceInr >= 10) {
    return 2;
  }
  return 1;
}

/** Decimal places a price needs so small coins keep their paise. */
export function priceDecimals(price: number): number {
  return price < 10 ? 4 : 2;
}

/** Plain number with grouping and at most `maxDecimals` decimals. */
export function formatNumber(value: number, maxDecimals = 2): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/** Coin amount with its symbol, e.g. `0.0142 BTC`. */
export function formatQuantity(
  value: number,
  symbol: string,
  maxDecimals = 8,
): string {
  return formatNumber(value, maxDecimals) + ' ' + symbol;
}

/** INR price with enough decimals for sub-₹10 coins, e.g. `₹8.1432`. */
export function formatPrice(value: number): string {
  const digits = priceDecimals(value);
  return (
    '₹' +
    value.toLocaleString('en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}

/** USDT amount, e.g. `$84,230.12`. Sub-$10 values keep four decimals. */
export function formatUsdt(value: number): string {
  const digits = priceDecimals(Math.abs(value));
  const sign = value < 0 ? '-' : '';
  return (
    sign +
    '$' +
    Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
}

/** Signed INR amount for P&L, e.g. `+₹2,340.00`. */
export function formatSignedInr(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return sign + formatInr(Math.abs(value), 'full');
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** `28 Sep 2026` */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return (
    date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear()
  );
}

/** `14:05:09` */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
}

/** `28 Sep 2026, 14:05` */
export function formatDateTime(timestamp: number): string {
  return formatDate(timestamp) + ', ' + formatTime(timestamp).slice(0, 5);
}

/**
 * Keeps what a user types into an amount field numeric: digits and one dot,
 * at most `maxDecimals` after it. Returns the cleaned text.
 */
export function sanitizeDecimalInput(text: string, maxDecimals = 8): string {
  const cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) {
    return whole;
  }
  return whole + '.' + rest.join('').slice(0, maxDecimals);
}

/** Parses an amount field; empty or malformed text is `NaN`. */
export function parseAmount(text: string): number {
  return text.trim() === '' ? NaN : Number(text);
}

/** Rounds down to `decimals` places, so a % of a balance never overshoots. */
export function floorTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.floor(value * factor + 1e-9) / factor;
}
