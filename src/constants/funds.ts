/** INR rails and limits. Replace with the payments API's configuration. */
export interface InrMethod {
  id: 'UPI' | 'IMPS' | 'NEFT';
  title: string;
  subtitle: string;
  max: number;
}

export const INR_DEPOSIT_METHODS: readonly InrMethod[] = [
  { id: 'UPI', title: 'UPI', subtitle: 'Instant · up to ₹1L', max: 100_000 },
  {
    id: 'IMPS',
    title: 'IMPS',
    subtitle: 'Within minutes · up to ₹5L',
    max: 500_000,
  },
  {
    id: 'NEFT',
    title: 'NEFT / RTGS',
    subtitle: 'Within 2 hours · up to ₹10L',
    max: 1_000_000,
  },
];

export const INR_MIN_DEPOSIT = 100;
export const INR_MIN_WITHDRAWAL = 100;
export const INR_MAX_WITHDRAWAL = 1_000_000;
/** IMPS payout fee, as on the Fee Structure screen. */
export const INR_WITHDRAWAL_FEE = 9;

/** How long a simulated deposit or withdrawal stays pending. */
export const SETTLEMENT_MS = 6000;

/** Promo codes and the INR bonus each credits once. */
export const COUPON_REWARDS: Readonly<Record<string, number>> = {
  WELCOME50: 50,
  DIWALI100: 100,
  CRYPTOEX25: 25,
};

/** Bank names by IFSC prefix, for the ones users have most often. */
export const BANK_NAMES: Readonly<Record<string, string>> = {
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  SBIN: 'State Bank of India',
  UTIB: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  YESB: 'Yes Bank',
  IDIB: 'Indian Bank',
  IDFB: 'IDFC FIRST Bank',
};

export const MAX_BANK_ACCOUNTS = 3;
