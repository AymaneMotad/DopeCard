# User Authentication Specification

## Overview

The authentication system handles user login, session management, and role-based access control.

## Current Implementation

**Location**: 
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `middleware.ts` - Route protection
- `app/providers.tsx` - Auth provider setup

**Status**: ✅ Working

## Technology Stack

- **NextAuth.js v4** - Authentication framework
- **Drizzle ORM** - Database adapter
- **bcryptjs** - Password hashing

## User Roles

- `admin` - Full system access
- `commercial` - Commercial agent access
- `client` - Business owner access
- `manager` - Staff/manager access

## Authentication Flow

1. User submits credentials
2. System validates credentials
3. Session created
4. JWT token issued
5. User redirected to dashboard

## Database Schema

Uses `users` table:
- `id`: UUID primary key
- `email`: Unique email address
- `username`: Unique username
- `password`: Hashed password (bcrypt)
- `role`: User role enum
- `active`: Active status flag

## API Endpoints

### NextAuth Routes
- `/api/auth/signin` - Sign in
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Get session
- `/api/auth/callback` - OAuth callback

## Protected Routes

Middleware protects:
- `/admin/*` - Admin routes
- `/homeDashboard` - Dashboard routes
- `/createPass` - Card creation (future)

## Session Management

- JWT-based sessions
- Configurable expiration
- Secure cookie storage
- CSRF protection

## Security Features

- Password hashing (bcrypt)
- Secure session storage
- CSRF tokens
- Rate limiting (future)
- Two-factor authentication (future)

## Future Enhancements

- OAuth providers (Google, GitHub)
- Two-factor authentication
- Password reset flow
- Email verification
- Session management UI
- Activity logging

## Testing Requirements

- [ ] Login flow tests
- [ ] Session management tests
- [ ] Role-based access tests
- [ ] Password hashing tests
- [ ] Middleware tests

