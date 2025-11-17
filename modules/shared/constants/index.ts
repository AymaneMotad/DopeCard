/**
 * Shared Constants
 * 
 * Common constants used across modules
 */

export const MAX_STAMPS = 50;
export const MIN_STAMPS = 2;
export const DEFAULT_STAMP_COUNT = 10;

export const CARD_TYPES = {
  STAMP: 'stamp',
  POINTS: 'points',
  DISCOUNT: 'discount',
  COUPON: 'coupon',
  MEMBERSHIP: 'membership',
  MULTIPASS: 'multipass',
  CASH_BACK: 'cash_back',
  REWARD: 'reward',
  GIFT: 'gift',
  CERTIFICATE: 'certificate', // Alias for gift
} as const;

export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  UNKNOWN: 'unknown',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  COMMERCIAL: 'commercial',
  CLIENT: 'client',
  MANAGER: 'manager',
} as const;

export const PASS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
} as const;

export const EXPIRATION_OPTIONS = {
  NONE: 'none',
  DAYS_30: 30,
  DAYS_60: 60,
  DAYS_90: 90,
  DAYS_180: 180,
  DAYS_365: 365,
} as const;

export const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const IMAGE_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

