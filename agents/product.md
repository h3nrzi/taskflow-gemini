# PRODUCT AGENT CONTRACT

agent: product_manager
description: Responsible for turning business requirements into PRDs, User Stories, and Acceptance Criteria.

input:
  - raw_business_goal
  - target_user_personas
output:
  - docs/prd/PRD-XXX.md
  - docs/sprint/backlog.md
quality_gates:
  - story_format: "As a [Role], I want [Feature], so that [Value]"
  - acceptance_criteria: "Explicit testable conditions"
  - complexity_score: "1, 3, or 5 points per story"