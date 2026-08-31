# Follow-up — Targeted Verification vs. Full Rebuilds

*Closing follow-up to [Post 2](02-targeted-verification-post.md) / [Article 2](02-targeted-verification.md).*

---

Follow-up to last week's post on targeted verification vs. full rebuilds.

I left a question open: where's the line between fast enough to iterate and thorough enough to trust?

Mine: it isn't a feeling, and it isn't "however confident I am after a few clean runs." It's the merge boundary. Full stop.

During iteration — red, green, refactor — you get the fast path: one targeted test against an already-running database, no rebuild, no teardown. It answers exactly the question you're asking, nothing more.

The moment code is about to become permanent — a PR, a merge, a deploy — that fast path stops being available. Mechanically. No matter how the last ten runs felt. Clean volumes, cold rebuild, full suite, every time.

Why mechanical, not judgment: "I'm pretty sure it's fine" is exactly the sentence that erodes a two-speed system back into always-full (slow) or never-full (risky) — usually the first time someone's under real deadline pressure. A rule that bends for confidence isn't a rule. It's a suggestion.

The boundary works because it doesn't ask "how sure am I." It asks "is this about to be permanent." Yes/no, tied to one event — not a vibe check anyone can talk themselves out of.

Not clever. Just enforced.
