# Post 5 — Stopping One Bad Assumption From Becoming Three

*Short-form LinkedIn post companion to the article: [05-escalation-scope-control.md](05-escalation-scope-control.md).*

---

Finding a hidden bug mid-task creates a dangerous temptation: "While I'm in this file, I'll just fix this second thing, clean up this package, and rewrite this helper."

It feels efficient. It's actually how scope quietly doubles and clean PRs turn into unreviewable rewrites.

Our rule: when any stage of the development loop hits something broken, incomplete, or incorrectly assumed from an earlier step, it escalates forward with a written ticket. It never quietly reworks prior output or expands its own scope inline.

A recent example: a code audit flagged duplicate class names across an old package structure and a new modular one. Investigation revealed three distinct situations:

1. A true duplicate with one caller → safe to delete.
2. An orphaned class with zero callers → dead code, safe to delete.
3. An in-progress architectural migration masquerading as a simple duplicate → high risk.

We fixed items 1 and 2 immediately, validated via targeted tests and the full pre-merge protocol. Item 3 was logged as its own explicit architectural decision.

Resist the urge to bundle fixes. Small, isolated changes keep your audit trail clean and your models focused.

Final post next week: what these five mechanisms add up to overall. **What's the last "while I'm in here" fix that quietly grew into something bigger than planned?**
