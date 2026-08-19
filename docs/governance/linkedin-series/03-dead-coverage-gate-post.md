# Post 3 — The Coverage Gate That Had Been Silently Dead

*Short-form LinkedIn post companion to the article: [03-dead-coverage-gate.md](03-dead-coverage-gate.md).*

---

For weeks, every code review on our project cited passing test coverage as settled fact. "JaCoCo passed" appeared in PR sign-offs like clockwork.

It wasn't checking anything.

The `jacoco-maven-plugin` `check` goal — the execution that actually enforces branch coverage floors — was bound to Maven's `verify` phase. But our CI pipeline and test containers only ran `mvn test`.

That phase generated the pretty HTML coverage report, but never ran the enforcing check. Every green build had been reading a report nobody was actually gating against.

We found it by asking one unglamorous question: does this gate actually run, or do we just trust it because it's written in a doc?

Rebinding the check to the `test` phase turned it from decoration into enforcement. Real measured coverage landed at 69.49% branch coverage — genuine headroom above our floor, but a wake-up call on pipeline trust.

Bonus finding from the same audit: a pre-commit hook blocking direct commits to `main` only lived in one developer's local `.git/hooks/` directory. It protected exactly one laptop.

Next week: the single database grant that was quietly neutralizing our multi-tenant security model. **Has your team ever discovered a "passing" gate that wasn't actually running?**
