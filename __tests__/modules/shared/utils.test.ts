/**
 * Shared Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  generateId,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  debounce,
} from '@/modules/shared/utils';

describe('formatDate', () => {
  it('should format a Date object', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date);
    expect(formatted).toContain('January');
    expect(formatted).toContain('2024');
  });

  it('should format a date string', () => {
    const formatted = formatDate('2024-01-15');
    expect(formatted).toContain('January');
    expect(formatted).toContain('2024');
  });
});

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should validate correct phone numbers', () => {
    expect(isValidPhone('+1234567890')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('123-456-7890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
    expect(isValidPhone('12345')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should trim and remove dangerous characters', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
    expect(sanitizeInput('test<script>')).toBe('testscript');
    expect(sanitizeInput('<div>content</div>')).toBe('divcontent/div');
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(callCount).toBe(1);
  });
});

