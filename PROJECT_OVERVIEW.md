# DopeCard Project Overview

Digital loyalty platform for Apple Wallet and Google Wallet with a web-based admin dashboard, customer registration, and scanner workflow.

## Core Flow
- Admin/Business creates a card template in the dashboard.
- System generates a registration link + QR for that template.
- Customer registers via `/register/[cardId]` and receives a pass.
- Scanner app updates stamps/points and triggers push updates.

## Roles & Ownership
- `admin`: full access.
- `commercial`: sales agent for onboarding businesses.
- `business`: owns card templates and staff managers.
- `manager`: staff who uses the scanner.
- `customer`: end user who registers and receives passes.

Business ownership is tracked by linking `customer` → `business` at registration time, using the card template’s `businessId`.

## Key Data Tables
- `users`: identity for all roles.
- `businesses`: business accounts.
- `pass_templates`: card templates, owned by a business.
- `user_passes`: issued passes (one per customer per card).
- `pass_registrations`: device registration for push updates.
- `pass_updates`: audit trail for changes (stamps, rewards, etc.).
- `customers`: customer profile linked to business ownership.

## Integrations
- **Apple Wallet**: pass generation + update endpoints.
- **Google Wallet**: JWT-based “Add to Wallet” flow.
- **QStash**: async push notifications.
- **APNS/FCM**: wallet push delivery.

## Current Status
- Card creation, registration, and scanner flows are implemented.
- Apple/Google pass generation is wired.
- QStash/APNS/FCM integrations are configured in `.env`.

## Known Follow-Ups
- Run migrations for `business`/`customer` role rename and table changes.
- Verify Apple device registration updates in production (webServiceURL).
