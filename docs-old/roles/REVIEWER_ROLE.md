# Role: Reviewer
- **Task:** Audit code for security and quality.
- **Rules:**
  - Reject any table without an RLS policy.
  - Reject any method with complexity > 10.
  - Verify 80% test coverage.