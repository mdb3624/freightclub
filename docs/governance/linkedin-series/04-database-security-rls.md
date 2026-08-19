# The Database Privilege That Was Quietly Defeating Our Security Model

*Article 4 of 6 in the series "Token Savings Through Governance." Previously: [The Coverage Gate That Had Been Silently Dead for Weeks](03-dead-coverage-gate.md).*

*(Publishing note: post the short-form version of this one to the feed without a link in the body, then drop this article link — and any supporting policy diagram — in the first comment. Links inside a LinkedIn post body suppress algorithmic reach; the first comment doesn't carry the same penalty.)*

## What the guarantee was supposed to be

Our platform is multi-tenant: many customer organizations share the same database, same tables, same application. The isolation between them has to be airtight, because the failure mode isn't "a bug" — it's one tenant's data becoming visible or writable by another tenant's users.

We built that isolation on native PostgreSQL row-level security (RLS): every table has a policy that scopes queries to `tenant_id = current tenant`, enforced by the database itself rather than by an application-layer `WHERE` clause that a future edit to a service method could accidentally omit. On paper, that's a materially stronger guarantee than the application-layer equivalent. It holds even if a developer — or an AI agent — writes a query that forgets to filter. The database refuses to return or modify rows outside the current tenant, full stop, regardless of what the calling code does or doesn't do.

## The gap nobody had audited

Here's what we found: the database role that every single application query runs as — the one connection pool the entire backend uses — held a `BYPASSRLS` privilege. That privilege had been granted early in the project's setup, for reasons that made sense at the time (bootstrapping, running migrations, general "let's not fight permissions while we're setting things up" convenience), and it had never been revoked once the project moved past that bootstrapping phase.

`BYPASSRLS` does exactly what it sounds like: a role with that privilege ignores row-level security policies entirely. It doesn't matter how correctly a policy is written, how thoroughly it's unit-tested, or how many times it's been reviewed — a role with `BYPASSRLS` walks straight past all of it, every time, silently. Our RLS policies existed. They were correctly written. They passed their own isolated tests. None of that mattered for the role that actually mattered, because that role had permission to ignore the entire mechanism.

This is a specific and common failure mode in security reviews: teams audit the *policies* — is this rule written correctly, does it cover the right condition — far more often than they audit the *grants* on the role actually executing queries. A policy is visible, versioned, and reviewed in every PR that touches it. A role's privileges, once granted, tend to sit quietly and get re-verified only when someone specifically thinks to ask.

## What happened when we fixed it

We revoked the `BYPASSRLS` privilege from the application's runtime role. Immediately — for the first time in the project's history — RLS was genuinely being enforced for real application traffic, not just in isolated policy tests.

Within minutes, a second problem surfaced, one that the first bug had been silently absorbing the whole time: several RLS policies had been written strictly around "a user can only touch rows belonging to their own tenant." That's correct for the common case — a shipper managing their own posted loads. It's *incorrect* for a specific, legitimate cross-tenant interaction baked into the product itself: a trucker, who registers as their own separate tenant, needs to claim, pick up, and deliver a load that belongs to a shipper's tenant. That's not a violation to block — it's the core transaction the platform exists to facilitate. But the policy, read literally, didn't distinguish "a stranger trying to touch your data" from "the counterparty in a transaction you both agreed to."

The bypass privilege had been silently smoothing over that mismatch since day one. The moment real enforcement kicked in, the mismatch became visible — and it became visible immediately, not months later in a security incident, because we'd just finished revoking the thing that had been hiding it.

## What we did with what we found

We did not quietly patch the policy inline and move on, and we did not re-grant the bypass privilege to make the immediate problem go away. We documented it as tracked, open technical debt, with a specific proposed fix (adding a second session-scoped identifier alongside tenant — a "current acting user" alongside "current tenant" — so policies can distinguish a legitimate counterparty action from an actual cross-tenant violation) and left it visible for the next person auditing the project to find, rather than burying it in an unreviewed diff.

That's the actual point of a governance system, and it's worth being explicit about: the goal isn't to be able to say "we're fully secure." It's to make sure that when something isn't, the gap is documented and tracked instead of quietly worked around — because quietly working around it is exactly how a gap like this stays invisible for another six months.

## The takeaway

Security reviews that focus entirely on policy correctness and never audit the privileges of the role actually running queries have a blind spot, and it's an easy one to have without noticing, because the policies genuinely can be correct and the queries genuinely can still bypass them. The fix here wasn't cleverness — it was asking a question nobody had asked in a while: does the role executing our queries actually have to obey the rules we wrote for it?

Next in the series: how we keep a discovery like this one from turning into an uncontrolled, scope-creeping rewrite once someone starts pulling on the thread.

**Question for you:** when did your team last audit the actual grants on your application's database role, rather than just the policies?
