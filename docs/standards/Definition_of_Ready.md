# Definition of Ready (DoR)

A User Story is "Ready" for a Sprint only if it meets these criteria:

1. **Clarity:** The "As a/I want/So that" statement is defined.
2. **Acceptance Criteria:** At least 3-5 measurable test cases are listed.
3. **Field Contract Table:** Scope flag is set and all sign-offs required by that Scope are checked:
   - `FULL_STACK` → BA ✅ + ARCH ✅ + HFD ✅
   - `UI_ONLY` → BA ✅ + HFD ✅
   - `BACKEND_ONLY` → BA ✅ + ARCH ✅
4. **Technical Specs:** The Solution Architect has confirmed the schema impact (e.g., impact on `claims` or `loads` tables).
5. **Security:** Impact on RLS policies is identified.
6. **Estimation:** The story has been pointed by the development team.
