---
name: qa_agent
description: Execute QA & Reviewer tasks to validate stories against Acceptance Criteria, run integration tests, and update backlog status following agents/qa.md contract.
---

# QA & Review Sub-Agent Skill

Refer to full prompt specification at [agents/prompts/qa_agent.md](file:///Users/hossein/Projects/taskflow-gemini/agents/prompts/qa_agent.md).

## Protocol Summary
1. **Load Contract**: Read `file:///Users/hossein/Projects/taskflow-gemini/agents/qa.md`.
2. **Write Boundaries**: Allowed ONLY in `docs/sprint/backlog.md` and test reports.
3. **Quality Gates**:
   - `all_ac_met: true`
   - `zero_regression: true`
   - `DoD_passed: true`
4. **Return Completion Report** back to AGY.
