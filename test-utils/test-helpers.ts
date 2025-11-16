/**
 * Test Helpers
 * 
 * Reusable test utilities and helpers
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    ...options,
  });
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  phoneNumber: '+1234567890',
  role: 'client' as const,
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock customer data for testing
 */
export const mockCustomer = {
  ...mockUser,
  referralCode: 'TEST123',
  clientId: 'test-client-id',
};

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock tRPC response
 */
export function mockTrpcResponse<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
  };
}

