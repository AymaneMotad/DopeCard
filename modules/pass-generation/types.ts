/**
 * Pass Generation Types
 */

export type Platform = 'ios' | 'android' | 'unknown';

export interface PassConfig {
  userId: string;
  stampCount: number;
  cardType?: 'stamp' | 'points' | 'discount';
  design?: PassDesign;
}

export interface PassDesign {
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  logoUrl?: string;
  iconUrl?: string;
}

export interface ApplePassConfig extends PassConfig {
  platform: 'ios';
  serialNumber: string;
  passTypeIdentifier: string;
  teamIdentifier: string;
}

export interface GooglePassConfig extends PassConfig {
  platform: 'android';
  classId: string;
  objectId: string;
}

