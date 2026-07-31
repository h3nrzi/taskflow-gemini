---
name: architect_agent
description: Execute System Architect tasks to create ADRs, Zod schemas, and API contracts following agents/architect.md contract.
---

# System Architect Sub-Agent Skill

Refer to full prompt specification at [agents/prompts/architect_agent.md](file:///Users/hossein/Projects/taskflow-gemini/agents/prompts/architect_agent.md).

## Protocol Summary
1. **Load Contract**: Read `file:///Users/hossein/Projects/taskflow-gemini/agents/architect.md`.
2. **Write Boundaries**: Allowed ONLY in `docs/adr/` and `shared/schemas/`.
3. **Quality Gates**:
   - Contract-first: All endpoints strictly typed with Zod/TypeScript schemas.
   - Clean boundaries: Zero domain-logic mixing between DB and API layers.
4. **Return Completion Report** back to AGY.
