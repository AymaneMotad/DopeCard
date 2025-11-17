/**
 * Pass Generation Module Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePassForPlatform, detectPlatform } from '@/modules/pass-generation';
import { generatePass, generateGooglePass } from '@/app/utils/pass-generation/pass-generation';

// Mock the pass generation functions
vi.mock('@/app/utils/pass-generation/pass-generation', () => ({
  generatePass: vi.fn(),
  generateGooglePass: vi.fn(),
}));

// Mock the PWA generator to prevent fallback during tests
vi.mock('@/modules/pass-generation/pwa-generator', () => ({
  generatePWAPass: vi.fn(() => ({
    type: 'pwa',
    url: 'https://example.com/cards/test-user?userId=test-user&cardType=stamp',
  })),
  shouldUsePWAFallback: vi.fn(() => false),
  isGoogleWalletAvailable: vi.fn(() => true),
}));

describe('generatePassForPlatform', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Restore PWA generator mocks
    const { shouldUsePWAFallback } = await import('@/modules/pass-generation/pwa-generator');
    vi.mocked(shouldUsePWAFallback).mockReturnValue(false);
  });

  it('should generate iOS pass', async () => {
    const mockBuffer = Buffer.from('test-pass-data');
    vi.mocked(generatePass).mockResolvedValue(mockBuffer);

    const result = await generatePassForPlatform({
      userId: 'test-user',
      stampCount: 5,
      platform: 'ios',
    });

    expect(result.platform).toBe('ios');
    expect(result.data).toBe(mockBuffer.toString('base64'));
    expect(result.mimeType).toBe('application/vnd.apple.pkpass');
    expect(generatePass).toHaveBeenCalledWith('test-user', 5, 'stamp', undefined);
  });

  it('should generate Android pass', async () => {
    const mockBuffer = Buffer.from('https://pay.google.com/gp/v/save/test-token');
    vi.mocked(generateGooglePass).mockResolvedValue(mockBuffer);

    const result = await generatePassForPlatform({
      userId: 'test-user',
      stampCount: 5,
      platform: 'android',
    });

    expect(result.platform).toBe('android');
    expect(result.data).toBe('https://pay.google.com/gp/v/save/test-token');
    expect(generateGooglePass).toHaveBeenCalledWith('test-user', 5, 'stamp', undefined);
  });

  it('should use default stamp count of 0', async () => {
    const mockBuffer = Buffer.from('test-pass-data');
    vi.mocked(generatePass).mockResolvedValue(mockBuffer);

    await generatePassForPlatform({
      userId: 'test-user',
      platform: 'ios',
    });

    expect(generatePass).toHaveBeenCalledWith('test-user', 0, 'stamp', undefined);
  });

  it('should return PWA for unsupported platform', async () => {
    const { shouldUsePWAFallback } = await import('@/modules/pass-generation/pwa-generator');
    vi.mocked(shouldUsePWAFallback).mockReturnValueOnce(true);

    const result = await generatePassForPlatform({
      userId: 'test-user',
      platform: 'unknown' as 'ios',
    });

    expect(result.platform).toBe('pwa');
    expect(result.data).toHaveProperty('type', 'pwa');
    expect(result.data).toHaveProperty('url');
  });
});

describe('detectPlatform', () => {
  it('should detect iOS', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')).toBe('ios');
  });

  it('should detect Android', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 10)')).toBe('android');
  });

  it('should return unknown for other platforms', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('unknown');
  });
});

