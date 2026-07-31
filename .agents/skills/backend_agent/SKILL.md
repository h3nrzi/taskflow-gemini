---
name: backend_agent
description: Execute Backend Developer tasks to implement Fastify API routes, services, DB logic, and unit tests following agents/backend.md contract.
---

# Backend Developer Sub-Agent Skill

Refer to full prompt specification at [agents/prompts/backend_agent.md](file:///Users/hossein/Projects/taskflow-gemini/agents/prompts/backend_agent.md).

## Protocol Summary
1. **Load Contract**: Read `file:///Users/hossein/Projects/taskflow-gemini/agents/backend.md`.
2. **Write Boundaries**: Allowed ONLY in `apps/api/src/` and `apps/api/prisma/`.
3. **Quality Gates**:
   - `typecheck_pass: true`
   - `tests_pass: true`
   - `fail_fast`: Reject invalid payload input with 422 Unprocessable Entity.
4. **Return Completion Report** back to AGY.
