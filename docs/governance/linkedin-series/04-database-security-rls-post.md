# Post 4 — The Privilege That Quietly Defeated Security

*Short-form LinkedIn post companion to the article: [04-database-security-rls.md](04-database-security-rls.md).*

*(Publishing note: post the text below directly — no link in the body. Drop the article link and any supporting RLS-policy diagram/snippet in the first comment instead. Links inside a post body suppress algorithmic reach; the first comment doesn't carry the same penalty.)*

---

Our multi-tenant data isolation relies on native PostgreSQL row-level security (RLS). Every query is automatically scoped to `tenant_id` by Postgres itself, rather than relying on application-layer `WHERE` clauses that an engineer might forget.

On paper, it was bulletproof. In reality? It wasn't running.

The application's database runtime role held a `BYPASSRLS` privilege — granted early in setup and never revoked. The RLS policies existed, were correctly written, and passed isolated unit tests. But in production, the application role was walking straight past them.

We revoked the privilege. RLS took effect instantly — and immediately surfaced a second issue: strict policies began blocking legitimate cross-tenant actions (e.g., a trucker fulfilling a shipper's load across tenant boundaries).

The bypass privilege had been silently masking that architectural mismatch the whole time.

Rather than quietly patching it inline or re-granting permissions, we documented it as tracked, open technical debt with a dedicated fix path.

That is the actual goal of system governance: not pretending code is perfect, but ensuring gaps are documented and tracked rather than hidden behind silent overrides.

Next week: how we keep a mid-task discovery from turning into an uncontrolled codebase rewrite. **How does your team catch privilege/permission drift before it becomes a production incident?**
