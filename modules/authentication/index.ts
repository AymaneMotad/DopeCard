/**
 * Authentication Module
 * 
 * Authentication and authorization functionality
 */

// This module will be expanded as auth features are refactored
// Currently serves as a placeholder for future modularization

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'commercial' | 'client' | 'manager';
}

export interface Session {
  user: AuthUser;
  expires: Date;
}

// Placeholder exports - will be implemented as features are refactored
export const authentication = {
  // Future functions will be added here
};

