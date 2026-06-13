# FreightClub Vault Index

A complete cross-referenced guide to all project documentation. Use this as your navigation hub.

## 📋 Quick Navigation

### Getting Started
- [[README|README.md]] — Project overview, tech stack, running locally
- [[CLAUDE.md]] — Global AI instructions & conventions
- [[CLAUDE.local.md]] — Local environment overrides
- [[LOCAL_DEV_SETUP.md]] — Development environment setup
- [[RUN_SYSTEM_LOCALLY.md]] — Step-by-step local execution guide

### Core Documentation
- [[ARCHITECTURE.md]] — System design, multi-tenancy, ADRs, schema
- [[FEATURES.md]] — Feature catalog and descriptions
- [[REQUIREMENTS.md]] — Business & technical requirements

---

## 🏗️ Architecture & Design

### Design Documents
- [[ARCHITECTURE.md]] — High-level system design & patterns
- [[Technical_Requirements.md|docs/architecture/Technical_Requirements.md]] — Technical specifications
- [[Schema_Map.md|docs/architecture/standards/Schema_Map.md]] — Database schema reference
- [[API.md]] — REST API endpoints & contracts

### Feature Designs (700 Series)
- [[DESIGN_CarrierProfiles_US701|docs/architecture/DESIGN_CarrierProfiles_US701.md]] — Carrier profile architecture
- [[DESIGN_LoadRecommendations_US702_US703|docs/architecture/DESIGN_LoadRecommendations_US702_US703.md]] — Recommendation engine
- [[DESIGN_LoadBoardAnalytics_US704|docs/architecture/DESIGN_LoadBoardAnalytics_US704.md]] — Analytics dashboard
- [[DESIGN_CarrierPerformance_US705|docs/architecture/DESIGN_CarrierPerformance_US705.md]] — Performance metrics
- [[DESIGN_RevenueReports_US706|docs/architecture/DESIGN_RevenueReports_US706.md]] — Revenue reporting
- [[API_CACHING_SPEC_700SERIES|docs/architecture/specs/API_CACHING_SPEC_700SERIES.md]] — Caching strategy
- [[700SERIES_MANDATORY_ADDENDUM|docs/architecture/specs/700SERIES_MANDATORY_ADDENDUM.md]] — Critical requirements

### Review & Sign-offs
- [[REVIEW_CarrierProfiles_US701|docs/architecture/REVIEW_CarrierProfiles_US701.md]]
- [[REVIEW_LoadRecommendations_US702_US703|docs/architecture/REVIEW_LoadRecommendations_US702_US703.md]]
- [[REVIEW_PaymentAccountSetup_US502|docs/architecture/REVIEW_PaymentAccountSetup_US502.md]]
- [[REVIEW_Phase7b_US704_US705_US706|docs/architecture/REVIEW_Phase7b_US704_US705_US706.md]]

---

## 📚 Business Documentation

### Stories & Backlog
- [[Story_Map.md|docs/project/Story_Map.md]] — Master story roadmap
- [[STORY_MAP_GUARDRAILS_TEMPLATE.md]] — Story template guidelines
- [[docs/business/stories|docs/business/stories/]] — Individual story files
- [[docs/business/personas|docs/business/personas/]] — Persona definitions

### Business Rules & Analysis
- [[FEATURES.md]] — Feature inventory
- [[REQUIREMENTS.md]] — Requirements catalog
- [[EDGE_CASES.md|docs/archive/business/EDGE_CASES.md]] — Edge case handling
- [[GLOSSARY.md|docs/archive/business/GLOSSARY.md]] — Domain terminology

---

## 🎯 Project Management

### Roadmaps & Planning
- [[PROJECT_PLAN.md]] — Full project roadmap
- [[ROADMAP.md]] — Phase overview
- [[docs/roadmaps/]] — Detailed roadmap documents

### Phases
- [[Phase 1: Core Load Lifecycle|docs/archive/phases/phase-1-core-load-lifecycle.md]]
- [[Phase 1.1: UX Hardening|docs/archive/phases/phase-1.1-ux-hardening.md]]
- [[Phase 1.2: Security Hardening|docs/archive/phases/phase-1.2-security-hardening.md]]
- [[Phase 2: Notifications|docs/archive/phases/phase-2-notifications.md]]
- [[Phase 3: Documents|docs/archive/phases/phase-3-documents.md]]
- [[Phase 4: Ratings|docs/archive/phases/phase-4-ratings.md]]
- [[Phase 5: Payments|docs/archive/phases/phase-5-payments.md]]
- [[Phase 6: Messaging|docs/archive/phases/phase-6-messaging.md]]
- [[Phase 7: Carrier Management|docs/archive/phases/phase-7-carrier-management.md]]
- [[Phase 7b: Financial Intelligence|docs/archive/phases/phase-7b-financial-intelligence.md]]
- [[Phase 8: Bidding|docs/archive/phases/phase-8-bidding.md]]
- [[Phase 9: Admin|docs/archive/phases/phase-9-admin.md]]

### Sprints & Status
- [[docs/sprints/]] — Sprint tracking
- [[docs/project/Sprint_Log.md]] — Sprint history

---

## 🛠️ Standards & Governance

### Standards
- [[docs/standards/]] — Technical standards directory
- [[postgres-native.md|.claude/rules/postgres-native.md]] — PostgreSQL standards
- [[ui-standards.md|.claude/rules/ui-standards.md]] — UI/Frontend standards
- [[testing_standards.md|.claude/rules/testing_standards.md]] — Testing requirements

### Rules & Governance
- [[docs/governance/]] — Governance documents
- [[CLAUDE.md]] — AI interaction conventions
- [[CONTRIBUTING_GOVERNANCE.md]] — Development workflow
- [[PROJECT_CONSTITUTION.md]] — Project governance

### Role Definitions
- [[docs/roles/]] — Role-based responsibility documents
- [[ARCHITECT.md|docs/roles/ARCHITECT.md]] — Architect role
- [[CODER.md|docs/roles/CODER.md]] — Coder role
- [[REVIEWER.md|docs/roles/REVIEWER.md]] — Reviewer role
- [[LIBRARIAN.md|docs/roles/LIBRARIAN.md]] — Librarian role
- [[BUSINESS_ANALYST.md|docs/roles/BUSINESS_ANALYST.md]] — BA role
- [[HUMAN_FACTORS_DESIGNER.md|docs/roles/HUMAN_FACTORS_DESIGNER.md]] — HFD role

---

## 🧪 Testing & Quality

### Testing Documentation
- [[TEST_ENVIRONMENT.md]] — Test environment setup
- [[testing_standards.md|.claude/rules/testing_standards.md]] — Testing requirements
- [[CRITICAL_ISSUE_TEST_PLAN.md]] — Critical issue testing
- [[docs/testing/]] — Testing documentation

### Coverage & Audits
- [[BACKEND_COVERAGE_REMEDIATION_ROADMAP.md]] — Coverage targets
- [[CONFIGURATION_COMPLIANCE_REVIEW.md]] — Compliance status
- [[GATE_AUDIT_FINAL_2026_05_15.md]] — Final gate audit

---

## 🚀 Deployment & DevOps

### Deployment Guides
- [[DEPLOYMENT.md]] — Deployment procedures
- [[DEPLOYMENT_CHECKLIST.md]] — Pre-deployment checklist
- [[GCP_DEPLOYMENT_SETUP.md]] — Google Cloud setup
- [[GOOGLE_CLOUD_DEPLOYMENT_READY.md]] — Cloud readiness status
- [[PRODUCTION_DEPLOYMENT_READY.md]] — Production readiness

### Configuration
- [[MAVEN_LOCAL_SETUP.md]] — Maven setup (Windows)
- [[LOCAL_DEV_SETUP.md]] — Local environment

### Database
- [[POSTGRES_MIGRATION.md]] — MySQL → PostgreSQL migration
- [[database-migrations.md]] — Migration tracking
- [[docs/project/]] — Project-specific docs

---

## 📊 Reports & Status

### Completion Reports
- [[PHASE_7_COMPLETION_SUMMARY.md]] — Phase 7 summary
- [[LIBRARIAN_SIGN_OFF_PHASE_7.md]] — Librarian approval
- [[REVIEWER_SIGN_OFF_PHASE_7.md]] — Reviewer approval
- [[PHASE7_COMPLETION_STATUS.md]] — Detailed status
- [[PHASE7_ANALYTICS_STATUS_CORRECTED.md]] — Analytics corrections

### Critical Issues
- [[CRITICAL_ISSUES_STATUS.md]] — Open issues tracker
- [[KNOWN_ISSUES.md]] — Known issues
- [[REMEDIATION_PLAN.md]] — Fix roadmap

### Analysis & Audits
- [[PROJECT_AUDIT_REPORT_2026_05_19.md]] — Comprehensive audit
- [[ARCHITECTURE_AUDIT_2026-05-07.md]] — Architecture review
- [[GLOBAL_MIGRATION_READINESS_REPORT.md]] — Migration status
- [[GLOBAL_HARDENING_REPORT.md]] — Security hardening status

---

## 📝 Specifications & Details

### API & Integration
- [[API.md]] — API documentation
- [[INTEGRATION_TEST_IMPLEMENTATION_GUIDE.md]] — Integration testing

### Feature Specs
- [[Quick_Pay_Settlement_Design|docs/architecture/Quick_Pay_Settlement_Design.md]]
- [[DESIGN_PaymentAccountSetup_US502|docs/architecture/DESIGN_PaymentAccountSetup_US502.md]]

### Debugging & Troubleshooting
- [[DEBUG_REGISTRATION.md]] — Registration debugging
- [[BUNDLE_ANALYSIS_GOLDEN_PATH.md]] — Bundle analysis
- [[BUNDLE_ANALYSIS_LOGIN_ROUTE.md]] — Login performance

---

## 🔄 Change & Debt Management

### Changes
- [[docs/changes/]] — Change request directory
- [[CHG-703.md]] — Change request example
- [[change-request-protocol.md|.claude/rules/change-request-protocol.md]] — CHG protocol

### Technical Debt
- [[debt-management.md|.claude/rules/debt-management.md]] — Debt logging protocol
- [[.claude/learnings.md|.claude/learnings.md]] — Technical debt ledger

---

## 🎨 Design & UX

### HFD Documentation
- [[docs/hfd/]] — Human Factors Designer specs

### Design Assets
- [[docs/design/]] — Design files
- [[docs/standards/brand_assets|docs/standards/brand_assets/]] — Brand standards

---

## 📖 Reference & Templates

### Templates
- [[docs/templates/]] — Document templates
- [[STORY_MAP_GUARDRAILS_TEMPLATE.md]] — Story template

### Quick References
- [[ROLE_QUICK_REFERENCE.md]] — Role cheat sheet
- [[ROLE_INTERACTIONS.md]] — How roles interact
- [[ROLE_DATA_FLOW.md]] — Data flow across roles

---

## 🔍 How to Use This Index

1. **Find what you need** — Use the categories above to locate documents
2. **Follow links** — Click any [[link]] to jump to that document
3. **Use bidirectional links** — Most documents now link back here
4. **Search by type** — Group documents by purpose (architecture, testing, etc.)

### Vault Features
- **Quick Open** — Cmd+O (or Ctrl+O) → type document name
- **Graph View** — See connections between all documents
- **Backlinks** — See which documents reference the current one
- **Search** — Cmd+F (or Ctrl+F) → search across all documents

---

## 📌 Key Document Relationships

```
README.md
├── CLAUDE.md (conventions)
├── ARCHITECTURE.md (design)
├── FEATURES.md (catalog)
└── PROJECT_PLAN.md (roadmap)
    ├── docs/project/Story_Map.md (stories)
    ├── docs/roles/ (responsibilities)
    ├── docs/standards/ (technical standards)
    └── docs/architecture/ (design details)
```

---

## 🔗 External References

- **Local AI Instructions** — [[CLAUDE.md]], [[CLAUDE.local.md]]
- **Role Definitions** — [[docs/roles/]]
- **Technical Debt** — [[.claude/learnings.md]]
- **Project Memory** — [[.claude/projects/c--projects-freightclub/memory/MEMORY.md]]

---

**Last Updated:** 2026-06-12  
**Maintainer:** Librarian  
**Status:** 🟢 Complete cross-reference system
