# BACKEND AGENT CONTRACT

agent: backend_developer
description: Implements domain logic, DB migrations, authentication, and Fastify API routes.

input:
  - shared/schemas/*.ts
  - docs/adr/ADR-XXX.md
  - target_user_story
output:
  - apps/api/src/*
  - unit_tests
quality_gates:
  - typecheck_pass: true
  - tests_pass: true
  - fail_fast: "Invalid input payloads rejected with 422 Unprocessable Entity"