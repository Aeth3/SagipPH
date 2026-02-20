# Architecture Boundaries

This codebase follows a Clean Architecture-inspired layering model. The goal is strict dependency direction and minimal framework leakage.

## Layers

- `domain`: entities, repository contracts, and use cases
- `data`: repository implementations and data sources
- `infra`: external adapters (http, storage, network, database)
- `composition`: wiring/dependency injection (use case + repository instances)
- `presentation`: reusable UI hooks/components
- `features`: feature-specific controllers/screens

## Dependency Direction

Allowed direction (inner to outer references are NOT allowed):

1. `domain` depends on: `domain` only
2. `data` depends on: `domain`, `infra`
3. `composition` depends on: `domain`, `data`, `infra`
4. `presentation` depends on: `composition`, `domain` (types/constants), UI libs
5. `features` depends on: `composition`, `domain`, `presentation`, UI libs

## Guardrails

ESLint rules in `.eslintrc.js` enforce import boundaries:

- `domain` violations are `error`
- `composition` violations are `error`
- `features` and `presentation` boundary leaks are currently `warn`

Raise `warn` to `error` when current leaks are removed.

## Current Known Leaks

- `package/src/features/**/*`
multiple feature screens still import `legacyApp` modules directly
- `package/src/features/Chat/ChatScreen.js`
imports `package/src/legacyApp` tokens directly

## Refactor Priorities

1. Replace `legacyApp` direct imports with domain/presentation design tokens.
2. Move feature-level business rules from screens into controllers/use cases.
3. Continue incremental migration of legacy auth screens into `features` with clean boundaries.
