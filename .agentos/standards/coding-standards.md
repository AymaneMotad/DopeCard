# Coding Standards

## TypeScript Standards

### General Rules
- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown
- Use const assertions where appropriate

### Naming Conventions
- **Files**: kebab-case (e.g., `pass-generation.ts`)
- **Components**: PascalCase (e.g., `LoyaltyPassGenerator.tsx`)
- **Functions/Variables**: camelCase (e.g., `generatePass`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_STAMPS`)
- **Types/Interfaces**: PascalCase (e.g., `PassConfig`)

### Code Organization
- One component/function per file
- Group related functionality in modules
- Use barrel exports (`index.ts`) for modules
- Keep files under 300 lines when possible

## Next.js Standards

### App Router Structure
- Use App Router (`app/` directory)
- Route handlers in `route.ts` files
- Server components by default, client components when needed
- Use `'use client'` directive only when necessary

### Data Fetching
- Use Server Components for data fetching
- Use tRPC for type-safe API calls
- Implement proper error boundaries
- Handle loading states appropriately

### File Structure
```
app/
  [route]/
    page.tsx        # Page component
    layout.tsx      # Layout (optional)
    loading.tsx     # Loading UI (optional)
    error.tsx       # Error UI (optional)
```

## tRPC Standards

### Router Organization
- Group related procedures in routers
- Use descriptive procedure names
- Implement proper input validation with Zod
- Handle errors gracefully

### Naming
- Routers: `[domain]Router` (e.g., `usersRouter`)
- Procedures: verb + noun (e.g., `create`, `getById`, `update`)
- Input schemas: descriptive names

### Error Handling
- Use tRPC error codes appropriately
- Provide meaningful error messages
- Log errors server-side
- Never expose sensitive information

## Database Standards (Drizzle ORM)

### Schema Organization
- One schema file per domain
- Use enums for fixed value sets
- Define relationships explicitly
- Add indexes for frequently queried fields

### Migrations
- Generate migrations with `drizzle-kit`
- Review migrations before applying
- Never edit existing migrations
- Test migrations on staging first

## Testing Standards

### Test Structure
- Mirror source structure in `__tests__/`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test when possible

### Test Types
- **Unit tests**: Test individual functions/components
- **Integration tests**: Test tRPC routers and API routes
- **E2E tests**: Test complete user flows (future)

### Coverage Goals
- Minimum 70% coverage for new code
- 100% coverage for critical paths (pass generation, payments)
- Test error cases, not just happy paths

## Code Quality

### Linting
- Use ESLint with Next.js config
- Fix all linting errors before committing
- Use Prettier for formatting

### Type Safety
- No `@ts-ignore` or `@ts-expect-error` without justification
- Use type guards for runtime type checking
- Leverage TypeScript's type inference where appropriate

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images (Next.js Image component)
- Lazy load heavy components

## Security Standards

### Authentication
- Use NextAuth.js for authentication
- Validate all user inputs
- Implement proper session management
- Use HTTPS in production

### Data Protection
- Never log sensitive data
- Encrypt sensitive data at rest
- Use environment variables for secrets
- Implement rate limiting on APIs

### Input Validation
- Validate on both client and server
- Use Zod schemas for validation
- Sanitize user inputs
- Prevent SQL injection (Drizzle handles this)

