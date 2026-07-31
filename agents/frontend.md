# FRONTEND AGENT CONTRACT

agent: frontend_developer
description: Implements UI layouts, React components, state management, and API integrations.

input:
  - shared/schemas/*.ts
  - docs/prd/PRD-XXX.md
  - target_user_story
output:
  - apps/web/src/*
quality_gates:
  - design_system: "Tailwind CSS + shadcn/ui components"
  - error_handling: "Proper Toast & Alert states for 4xx/5xx responses"
  - type_safe_api: "100% consuming shared Zod schema types"