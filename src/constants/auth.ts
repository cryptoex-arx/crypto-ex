/** Sign-in is mobile number + OTP only; there is no password anywhere. */
export const COUNTRY_CODE = '+91';
export const MOBILE_NUMBER_LENGTH = 10;
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;

/** Groups a 10-digit number as `+91 98765 43210` for display. */
export function formatMobileNumber(digits: string): string {
  return COUNTRY_CODE + ' ' + digits.slice(0, 5) + ' ' + digits.slice(5);
}
