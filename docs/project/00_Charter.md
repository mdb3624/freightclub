# Project Charter: Resilience Logistics Platform

## 🎯 Mission
To build a high-concurrency trucking dispatch and financial management system specializing in real-time load orchestration and strict tenant isolation.

## 💻 Tech Stack
- **Backend:** Java 21, Spring Boot 3.2.5.
- **Database:** Neon Serverless Postgres (PostgreSQL 17).
- **Migrations:** Flyway (Community Edition).
- **Infrastructure:** AWS/Neon with Row Level Security (RLS).

## 🔑 Core Standards
- **Identifiers:** All primary/foreign keys MUST be `VARCHAR(36)` to ensure compatibility between JPA and Postgres `bpchar` types.
- **Security:** Tenant isolation is enforced at the database layer via RLS policies.