# Testing Strategy

This project now includes seven testing lanes:

## 1. Unit Testing
- Scope: entities, utilities, controllers, and isolated components.
- Command: `npm run test:unit`
- Location: `__tests__/**` excluding integration/accessibility/performance/security folders.

## 2. Integration Testing
- Scope: wiring between modules (example: `Main` lifecycle + providers + offline sync).
- Command: `npm run test:integration`
- Location: `__tests__/integration/**`

## 3. E2E Testing
- Scope: app-level behavior on emulator/device.
- Command: `npm run test:e2e`
- Files:
  - `.detoxrc.js`
  - `e2e/init.js`
  - `e2e/smoke.e2e.js`

## 4. Performance Testing
- Scope: regression guard for performance-sensitive logic.
- Command: `npm run test:performance`
- Location: `__tests__/performance/**`

## 5. Security Testing
- Scope: static checks for risky patterns (`eval`, obvious hardcoded secrets).
- Command: `npm run test:security`
- Location: `__tests__/security/**`

## 6. Manual Testing
- Scope: UX flows and device-specific checks not covered by automation.
- Command: `npm run test:manual`
- Checklist: `tests/manual/MANUAL_TESTING_CHECKLIST.md`

## 7. Accessibility Testing
- Scope: accessibility labels and screen-reader discoverability.
- Command: `npm run test:accessibility`
- Location: `__tests__/accessibility/**`

## Combined Runs
- All Jest projects: `npm test`
- Full coverage report: `npm run test:coverage`
