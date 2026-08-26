# The Coverage Gate That Had Been Silently Dead for Weeks

*Article 3 of 6 in the series "Token Savings Through Governance." Previously: [Targeted Verification vs. Full Rebuilds](02-targeted-verification.md).*

## A settled fact that wasn't

For weeks, every code review on this project cited passing test coverage as a settled fact. "JaCoCo passed" showed up in sign-off after sign-off, treated the way a green checkmark is supposed to be treated: as something that had actually been verified.

It hadn't been.

## How a real enforcement gate becomes decoration

The mechanics of the bug are worth walking through, because this exact failure mode — a check that looks like it's running but isn't — is common and easy to miss precisely because everything *around* it looks correct.

Our coverage tooling (`jacoco-maven-plugin`) has two relevant pieces: a `report` execution that generates the human-readable coverage percentage, and a `check` execution that actually *enforces* a minimum — it fails the build if coverage drops below a set floor. In our `pom.xml`, that `check` execution was bound to Maven's `verify` lifecycle phase. Our CI pipeline, and the Docker container our automated test protocol used, only ever ran `mvn test`.

`mvn test` runs everything up through the `test` phase — including `report`. It does not run `verify`, and therefore never runs `check`. The coverage percentage was being calculated and displayed correctly, every single time. The number just wasn't gating anything. A build that dropped ten points of coverage would still show `BUILD SUCCESS`, with a coverage report sitting right there looking exactly like it always had.

This is what makes this class of bug dangerous: it doesn't fail loudly. It doesn't fail at all. It produces a plausible, real-looking artifact — an actual percentage, actual HTML — that just happens to have no teeth.

## How we actually found it

Not by noticing a regression slip through — we got lucky there, in the sense that nothing had actually regressed badly enough to be an obvious problem yet. We found it by asking a boring, unglamorous question during an unrelated audit: *does this gate actually run, or do we just trust it because it's written down in a doc somewhere?* Checking which Maven phase the CI pipeline actually invoked, against which phase the enforcing goal was bound to, took minutes once someone thought to ask.

That's the actual lesson, more than the specific Maven lifecycle detail: the habit of periodically verifying that a described guarantee is a *real* guarantee, rather than trusting a passing status because it's been passing for a while, is what catches this. Nothing about our CI output would have told us. The output was, in a narrow technical sense, entirely accurate.

## The fix, and what it revealed

Rebinding the `check` execution to run at the `test` phase — the phase CI actually executes — turned the coverage gate from decoration into enforcement for the first time. Real, actually-enforced coverage measured at 69.49% branch coverage at the time of the fix: genuine headroom above the floor we then set, which was a relief, but also not something anyone could have honestly claimed to know before the fix landed.

The same audit turned up a second, smaller version of the same failure pattern: a pre-commit hook meant to block direct commits to `main` had been added and tested successfully — on one machine. `.git/hooks/` isn't version-controlled by default, so the hook only protected the exact clone it had been installed in. It looked like team-wide protection. It was protection for one laptop.

## The takeaway

A governance rule that isn't enforced by something that actually runs is a comment nobody reads, no matter how confidently it's documented or how official the language sounds. The uncomfortable version of this lesson: you can't tell the difference between a real gate and a decorative one by looking at its output alone — both a working check and a broken one that never runs produce the same "all green" signal. The only way to know is to periodically verify the mechanism itself, not just trust the status it reports.

Next in the series: the single database privilege that had been doing something eerily similar to our entire security model.

**Question for you:** has your team ever discovered a "passing" gate that, on closer inspection, wasn't actually checking anything?
