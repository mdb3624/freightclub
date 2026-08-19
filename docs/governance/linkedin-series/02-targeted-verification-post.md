# Post 2 — Targeted Verification vs. Full Rebuilds

*Short-form LinkedIn post companion to the article: [02-targeted-verification.md](02-targeted-verification.md).*

---

For a while, every small code change triggered the same heavy ritual: tear down Docker volumes, rebuild backend JARs and frontend assets from scratch, restart the stack, wait for health checks, and run the complete test suite.

Even for a one-line fix inside a single service method.

It wasn't rigor — it was habit. And it compounded into lost hours. We split verification into two explicit modes:

→ **Red/green iteration:** run a single test class against an already-running database container. No teardown, no full rebuild. It proves the immediate edit in seconds, not minutes.

→ **Mandatory pre-merge protocol:** before a PR merges, the full protocol runs without exception — clean volumes, cold rebuild, stack restart, health check, full suite run (902 tests, 0 failures, 0 errors on our last pass).

A full rebuild during active TDD doesn't buy more confidence than a targeted run already gave you — it just re-proves the same thing nine extra times. Save the expensive path for the actual merge gate.

Next week: what happens when the coverage gate everyone trusted turned out to be completely switched off. **Where does your team draw the line between "fast enough to iterate" and "thorough enough to trust"?**
