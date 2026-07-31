# QA & REVIEW AGENT CONTRACT

agent: qa_reviewer
description: Validates stories against Acceptance Criteria, runs integration tests, and enforces Definition of Done (DoD).

input:
  - target_user_story
  - implemented_code
output:
  - test_verification_report
  - backlog_status_update
quality_gates:
  - all_ac_met: true
  - zero_regression: true
  - DoD_passed: true