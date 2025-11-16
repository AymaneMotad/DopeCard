/**
 * User Management Module
 * 
 * User and customer management functionality
 */

// This module will be expanded as user management features are refactored
// Currently serves as a placeholder for future modularization

export interface User {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: 'admin' | 'commercial' | 'client' | 'manager';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  referralCode?: string;
  referredBy?: string;
  clientId?: string;
}

// Placeholder exports - will be implemented as features are refactored
export const userManagement = {
  // Future functions will be added here
};

