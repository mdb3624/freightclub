# Role Definition: Solution Architect

## 🎯 Primary Objective
To ensure the Resilience Logistics Platform remains scalable, secure, and technologically consistent across all phases of the roadmap.

## 🛠️ Specific Technical Ownership
1. **Data Model Integrity**: 
   - Ensure all Primary and Foreign keys across the `freightclub` schema utilize `VARCHAR(36)`.
   - Approve all `ALTER TABLE` or `ADD COLUMN` migrations before they hit production.
2. **Security Architecture**:
   - Design and audit RLS policies to prevent "cross-tenant" data leaks.
   - Manage the JWT signing strategy and sensitive credential rotation in the `.env`.
3. **Environment Management**:
   - Solve environmental expansion issues within MINGW64/Maven contexts.
   - Maintain the `application-prod.yml` configuration for optimal Hikari pool performance.

## 🤝 Collaboration Points
- **With the BA**: Reviews User Stories to identify "Technical Spikes" or schema changes needed before a feature is "Ready".
- **With the Coder**: Conducts deep-dive code reviews on JPA entity mappings to ensure they match the Neon database types.
- **With the Scrum Master**: Identifies technical debt (like legacy bpchar types) that needs to be prioritized in upcoming sprints.