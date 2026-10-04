import { notify } from '../notifications';
import { createPersistentStore } from '../storage/persistentStore';

export type KycStatus = 'notStarted' | 'inReview' | 'verified';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Profile {
  fullName: string;
  email: string;
  gender: Gender;
  /** `DD/MM/YYYY`. */
  dateOfBirth: string;
  /** 10 digits, no country code. */
  mobileNumber: string;
}

export interface KycState {
  status: KycStatus;
  pan?: string;
  aadhaarLast4?: string;
  submittedAt?: number;
  verifiedAt?: number;
}

export interface Nominee {
  name: string;
  relation: string;
  /** `DD/MM/YYYY`. */
  dateOfBirth: string;
}

export interface UserState {
  profile: Profile;
  kyc: KycState;
  nominee?: Nominee;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

/** How long the simulated KYC review takes. */
export const KYC_REVIEW_MS = 5000;

export const NOMINEE_RELATIONS = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Sibling',
] as const;

export const userStore = createPersistentStore<UserState>('cryptoex/user/v1', {
  profile: {
    fullName: 'Rahul Sharma',
    email: 'rahul@email.com',
    gender: 'Male',
    dateOfBirth: '15/08/1995',
    mobileNumber: '9876543210',
  },
  kyc: { status: 'notStarted' },
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z .']{2,}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_PATTERN = /^[2-9][0-9]{11}$/;

/** A real `DD/MM/YYYY` date in the past, or `undefined`. */
export function parseDate(text: string): Date | undefined {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) {
    return undefined;
  }
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getTime() < Date.now();
  return valid ? date : undefined;
}

function ageOn(date: Date, now = new Date()): number {
  const age = now.getFullYear() - date.getFullYear();
  const birthdayPassed =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  return birthdayPassed ? age : age - 1;
}

export function updateProfile(
  patch: Pick<Profile, 'fullName' | 'email' | 'gender'>,
): ActionResult {
  const fullName = patch.fullName.trim();
  const email = patch.email.trim();
  if (!NAME_PATTERN.test(fullName)) {
    return { ok: false, error: 'Enter your full name (letters only).' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  userStore.update(state => ({
    ...state,
    profile: { ...state.profile, ...patch, fullName, email },
  }));
  return { ok: true };
}

export function setMobileNumber(mobileNumber: string) {
  userStore.update(state => ({
    ...state,
    profile: { ...state.profile, mobileNumber },
  }));
}

export function validatePan(pan: string): string | undefined {
  return PAN_PATTERN.test(pan) ? undefined : 'PAN must look like ABCDE1234F.';
}

export function validateAadhaar(aadhaar: string): string | undefined {
  return AADHAAR_PATTERN.test(aadhaar)
    ? undefined
    : 'Aadhaar is 12 digits and cannot start with 0 or 1.';
}

let reviewTimer: ReturnType<typeof setTimeout> | undefined;

function completeReview() {
  reviewTimer = undefined;
  const { kyc } = userStore.get();
  if (kyc.status !== 'inReview') {
    return;
  }
  userStore.update(state => ({
    ...state,
    kyc: { ...state.kyc, status: 'verified', verifiedAt: Date.now() },
  }));
  notify(
    'account',
    'KYC verified',
    'You can now deposit and withdraw INR and crypto.',
  );
}

/** Schedules the simulated reviewer for a submission still in review. */
function scheduleReview() {
  const { kyc } = userStore.get();
  if (kyc.status !== 'inReview' || reviewTimer) {
    return;
  }
  const due = (kyc.submittedAt ?? 0) + KYC_REVIEW_MS - Date.now();
  reviewTimer = setTimeout(completeReview, Math.max(0, due));
}

/**
 * Sends PAN and Aadhaar for review. The simulated reviewer approves every
 * well-formed submission after `KYC_REVIEW_MS`.
 */
export function submitKyc(pan: string, aadhaar: string): ActionResult {
  const invalid = validatePan(pan) ?? validateAadhaar(aadhaar);
  if (invalid) {
    return { ok: false, error: invalid };
  }
  if (userStore.get().kyc.status !== 'notStarted') {
    return { ok: false, error: 'KYC has already been submitted.' };
  }
  userStore.update(state => ({
    ...state,
    kyc: {
      status: 'inReview',
      pan,
      aadhaarLast4: aadhaar.slice(-4),
      submittedAt: Date.now(),
    },
  }));
  scheduleReview();
  return { ok: true };
}

export function saveNominee(nominee: Nominee): ActionResult {
  const name = nominee.name.trim();
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, error: "Enter the nominee's full name." };
  }
  if (!NOMINEE_RELATIONS.includes(nominee.relation as never)) {
    return { ok: false, error: 'Choose how the nominee is related to you.' };
  }
  const born = parseDate(nominee.dateOfBirth);
  if (!born) {
    return { ok: false, error: 'Enter a valid date of birth as DD/MM/YYYY.' };
  }
  if (ageOn(born) > 120) {
    return { ok: false, error: 'Enter a valid date of birth.' };
  }
  userStore.update(state => ({ ...state, nominee: { ...nominee, name } }));
  return { ok: true };
}

export function removeNominee() {
  userStore.update(state => ({ ...state, nominee: undefined }));
}

export async function hydrateUser() {
  await userStore.hydrate();
  scheduleReview();
}
