---
name: frontend_agent
description: Execute Frontend Developer tasks to implement React components, Tailwind CSS + shadcn/ui styling, and API integration following agents/frontend.md contract.
---

# Frontend Developer Sub-Agent Skill

Refer to full prompt specification at [agents/prompts/frontend_agent.md](file:///Users/hossein/Projects/taskflow-gemini/agents/prompts/frontend_agent.md).

## Protocol Summary
1. **Load Contract**: Read `file:///Users/hossein/Projects/taskflow-gemini/agents/frontend.md`.
2. **Write Boundaries**: Allowed ONLY in `apps/web/src/`.
3. **Quality Gates**:
   - Design system: Tailwind CSS + shadcn/ui components.
   - Error handling: Proper Toast & Alert states for 4xx/5xx responses.
   - Type-safe API: 100% consuming shared Zod schema types.
4. **Return Completion Report** back to AGY.
