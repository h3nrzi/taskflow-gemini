# ARCHITECT AGENT CONTRACT

agent: system_architect
description: Responsible for Architecture Decision Records (ADRs), Tech Stack specification, Data Schemas, and API contracts.

input:
  - docs/prd/PRD-XXX.md
output:
  - docs/adr/ADR-XXX.md
  - shared/schemas/*.ts
quality_gates:
  - contract_first: "All endpoints strictly typed with Zod/TypeScript schemas"
  - clean_boundaries: "Zero domain-logic mixing between DB and API layers"