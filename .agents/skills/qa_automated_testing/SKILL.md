---
name: qa_automated_testing
description: Comprehensive QA testing strategy with Vitest integration suites, monorepo typecheck verification, visual UX checks, and Definition of Done validation.
---

# QA Automated Testing & Review Skill

This skill defines the quality control protocol, test suite execution standards, typecheck verification, and Definition of Done (DoD) compliance auditing.

## 1. Automated Integration Test Suite (`Vitest`)
- Write and execute integration tests verifying API endpoint responses, status codes, and error payloads:
  - Valid payloads -> `200 OK` / `201 Created`
  - Invalid inputs -> `422 Unprocessable Entity`
  - Unauthorized calls -> `401 Unauthorized` / `403 Forbidden`
- Run test suites using `npm test` or `npx vitest run`.

## 2. Monorepo Typecheck Verification
- Execute strict TypeScript compilation checks across all monorepo packages and apps (`npx tsc --noEmit`). Zero compilation errors permitted.

## 3. Acceptance Criteria (AC) Auditing
- Verify every AC listed in PRDs and sprint user stories using empirical test execution evidence.

## 4. Definition of Done (DoD) & Reporting
- Ensure clean code formatting, zero unused variables, updated sprint backlog statuses, and comprehensive markdown verification reports in `docs/reports/`.
