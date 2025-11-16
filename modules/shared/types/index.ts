/**
 * Shared Types
 * 
 * Common TypeScript types used across modules
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

