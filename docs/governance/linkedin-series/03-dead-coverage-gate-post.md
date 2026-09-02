# Post 3 — The Coverage Gate That Had Been Silently Dead

*Short-form LinkedIn post companion to the article: [03-dead-coverage-gate.md](03-dead-coverage-gate.md).*

*Published: [The Coverage Gate That Had Been Silently Dead for Weeks](https://www.linkedin.com/pulse/coverage-gate-had-been-silently-dead-weeks-mike-barnes-pdjzc)*

---

For weeks, "JaCoCo passed" meant nothing. The check goal enforcing branch coverage was bound to Maven's verify phase — but our pipeline only ran test. Every green build was reading a report, not a gate.

We asked one question: does this actually run, or do we just trust the doc? Rebinding it to test turned decoration into enforcement. Real coverage: 69.49% — good news, but a wake-up call.

Bonus find: our main-branch protection hook only existed on one laptop.

Has your team ever found a passing gate that wasn't running?
