# File Structure Standards

## Project Root Structure

```
dope-card/
├── .agentos/              # Agent OS configuration and specs
├── app/                   # Next.js App Router
├── components/            # Reusable React components
├── modules/               # Domain modules (new structure)
├── server/                # tRPC server and routers
├── db/                    # Database schema and config
├── lib/                   # Shared utilities
├── __tests__/            # Test files
├── test-utils/            # Test utilities and helpers
├── scripts/               # Utility scripts
└── public/                # Static assets
```

## Module Structure

Each domain module should follow this structure:

```
modules/
  [domain-name]/
    ├── index.ts           # Public API (barrel export)
    ├── types.ts           # TypeScript types
    ├── utils.ts           # Domain-specific utilities
    ├── constants.ts       # Domain constants
    ├── [feature].ts       # Feature implementations
    └── __tests__/         # Module tests
        └── [feature].test.ts
```

## Component Structure

```
components/
  [component-name]/
    ├── index.tsx          # Component file
    ├── [component-name].tsx  # Alternative: single file
    └── __tests__/
        └── [component-name].test.tsx
```

## Router Structure

```
server/
  routers/
    [domain]Router.ts      # Domain router
  trpc.ts                  # tRPC setup
  client.ts                # tRPC client
```

## Test Structure

Tests mirror source structure:

```
__tests__/
  app/
    [route]/
      page.test.tsx
  components/
    [component]/
      [component].test.tsx
  modules/
    [domain]/
      [feature].test.ts
  server/
    routers/
      [domain]Router.test.ts
```

## Naming Conventions

### Directories
- Use kebab-case for directories
- Be descriptive and specific
- Group related files together

### Files
- **Components**: PascalCase (e.g., `UserCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Config**: kebab-case (e.g., `drizzle.config.ts`)
- **Tests**: Same as source + `.test` (e.g., `UserCard.test.tsx`)

### Exports
- Use named exports for utilities
- Use default exports for components (optional)
- Use barrel exports (`index.ts`) for modules

## Import Organization

Order imports as follows:
1. External dependencies (React, Next.js, etc.)
2. Internal modules (`@/modules/...`)
3. Components (`@/components/...`)
4. Utilities (`@/lib/...`)
5. Types (`@/types/...`)
6. Relative imports (`./...`)

Example:
```typescript
import { useState } from 'react';
import { NextPage } from 'next';

import { generatePass } from '@/modules/pass-generation';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

import type { PassConfig } from '@/types/pass';
import { localHelper } from './helpers';
```

## File Size Guidelines

- **Components**: Keep under 200 lines
- **Utilities**: Keep under 150 lines
- **Routers**: Keep under 300 lines
- **Schema files**: Keep under 500 lines

If a file exceeds these limits, consider:
- Extracting sub-components
- Splitting into multiple files
- Creating helper functions
- Breaking into smaller modules

