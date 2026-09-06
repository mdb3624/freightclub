# Claude Code Insights

14 sessions total · 12 analyzed · 415 messages · 2178h · 45 commits
2026-06-24 to 2026-08-31

## At a Glance

**What's working:** You treat Claude as a system to maintain rather than a tool to poke at — auditing and de-duplicating your own skills, standing up an MCP server for LinkedIn publishing, and running council-style adversarial reviews before committing to a decision. That council pattern, where competing perspectives get synthesized into a verdict, is a genuinely sophisticated way to use agents and it consistently produced your cleanest outcomes. You also push back well: when Claude claimed it couldn't verify a license without browser automation, you named the tool it should use and it worked, catching a wrong answer in the process.

**What's hindering you:** On Claude's side, the recurring failure is premature confidence — declaring a capability impossible when it wasn't, and acting on guesses about external systems (stripping markdown based on a wrong assumption about LinkedIn's article editor, or drafting a technical agenda when you wanted a casual intro). On your side, most of the drag is environmental and arrives late: expired OAuth tokens, wrong .env paths, a hung pre-commit hook, a shadowing test config. These surface at the finish line because nothing checks for them at the start, and stating the audience and destination format up front would head off the assumption problems.

**Quick wins to try:** Turn your council-review pattern into a real Custom Skill so it's one slash command instead of a re-explained prompt each time — same for your recurring publishing and PR sequences. Add a Hook that runs a preflight check (auth status, MCP registration, hook health) so stale credentials fail loudly before you're three steps into a publish. And keep leaning on subagents for archaeology work like "find every duplicate skill" or "explain why this YAML is shadowing that one."

**Ambitious workflows:** Expect your council review to become genuinely parallel: independent reviewer agents writing findings in isolation, critiquing each other in a second round, and producing a ranked verdict with dissents preserved as a committed decision record. Expect publishing pipelines that verify every credential and API capability first, show you a fidelity diff of the conversion, and halt with a remediation checklist rather than half-finishing. And the test loop you drove interactively will run unattended overnight — point an agent at failing tests, let it iterate, and review a finished branch with a PR in the morning.

## Project Areas

### LinkedIn Content Strategy & Publishing (3 sessions)
Work centered on defining a documented LinkedIn series strategy, running editorial reviews across drafted posts and articles, and building a markdown-to-LinkedIn publishing pipeline. Claude cloned, built, and registered a LinkedIn MCP server, handled authentication, and published a post paired with an article. API limitations blocked native article creation and post edits/deletions, and one session left authentication pending a restart.

### Agent Skills & Council Review Workflows (2 sessions)
Claude was used to audit and de-duplicate overlapping skill definitions (roast vs. council-review, dual code-review paths, wrap-up vs. session-handoff) and then apply council-style adversarial review to proposed changes. Sessions involved multi-file edits, sub-agent orchestration, and synthesized verdicts on whether to add capabilities like adversarial testing to the pipeline or a skill to the BA role.

### Backend Testing & CI Configuration (2 sessions)
Follow-on engineering work drove a Java backend test suite and auth verification to a clean passing state. Claude debugged a shadowing application-test.yml that caused a configuration detour, self-corrected an unnecessary background job scheduling decision, and worked around a pre-commit hook that hung indefinitely by using --no-verify.

### Version Control & PR Workflow (3 sessions)
A recurring thread across sessions was landing changes through commits and pull requests, with 45 commits recorded overall. Claude handled branching, commit authoring, and PR creation for documentation and tooling changes, mostly relying on Bash and Edit. Friction came from a hanging pre-commit hook and occasional permission-classifier blocks.

### Personal Research & Household Automation (3 sessions)
Claude assisted with non-code tasks including verifying a podiatrist's TDLR license via browser automation, explaining Epsom vs. table salt for ingrown toenails, adding recipes, diagnosing an over-baked brownie, and importing a credit card statement. Most tasks succeeded, though the statement import stalled on an expired Google OAuth token requiring manual console steps, and one recipe needed user-supplied text.

## Interaction Style

You work in short, conversational bursts rather than long upfront specifications — you throw out a goal ("find and resolve duplicate skills," "verify this license," "publish this post") and let Claude figure out the path, then course-correct in real time when it drifts. The meet-and-greet agenda session is the clearest example: you asked for an agenda, got a dense technical progress deck, and simply redirected rather than re-specifying from scratch. **You treat the first response as a draft, not a deliverable.** This is why your friction profile skews toward "wrong_approach" (3x) rather than "misunderstood_request" — Claude generally hears you correctly but guesses wrong about scope or tone, and you catch it on the next turn.

You're notably willing to push back on Claude's stated limitations. When Claude claimed it couldn't verify a podiatrist's TDLR license without browser automation, you insisted Playwright should work — and it did. **You don't accept "I can't" at face value**, which is a distinctive trait and one that repeatedly converts a dead end into a full success. Similarly, when the LinkedIn API blocked article creation and post deletion, you didn't abandon the workflow; you took over the manual steps yourself and let Claude finish the rest.

Your tool profile is Bash-dominant (496 calls, roughly 3.5x the next tool) against a Markdown-heavy corpus — this is an operator's workflow: git operations, builds, MCP server registration, test suites, publishing pipelines. Six sessions center on version control and 45 commits landed. You also lean on structured deliberation: you repeatedly invoked council-style adversarial reviews before committing to a change, which suggests **you use Claude as a decision-forcing mechanism, not just an executor**.

**Key pattern:** You treat Claude's first answer and its stated limitations as negotiable, redirecting scope mid-session and pushing back on "I can't" until the task actually gets done.

## What Works

Across 12 sessions spanning June through August, you've used Claude Code as a genuine collaborator across engineering, publishing, and personal-life logistics — with 45 commits and a heavy Bash-driven workflow.

### Adversarial council review process
You've built and refined a 'council review' pattern where multiple perspectives adversarially critique a proposal before you commit to it — used both for adding adversarial testing to your pipeline and for evaluating a BA role change. Rather than accepting the first plausible answer, you force synthesis of competing verdicts, which is a genuinely sophisticated way to use agents for decision-making.

### Pushing back on premature 'can't'
When Claude claimed it couldn't verify a podiatrist's TDLR license without browser automation, you pushed back and pointed out Playwright should work — and it did, catching an erroneous 'expired' claim in the process. You treat Claude's limitations as hypotheses to test rather than facts to accept, which repeatedly unlocks work that would otherwise have stalled.

### Curating your own tooling ecosystem
You actively audit and deduplicate your own skills — spotting overlaps between roast/council-review, dual code-review, and wrap-up/session-handoff, then having Claude resolve them. You also cloned, built, and registered an MCP server for LinkedIn publishing rather than doing things by hand. You're treating your Claude setup as a system to maintain, not just a tool to use.

## Friction Analysis

Across 8 analyzed sessions you generally got where you were going, but you repeatedly lost time to Claude giving up too early on tooling, making unverified assumptions about external platforms, and stalling on auth/config issues that only you could unblock.

### Claude prematurely declaring things impossible
Several times Claude asserted a capability limit that didn't actually exist, and only your pushback unlocked the correct path. You can shortcut this by naming the tool you expect Claude to use up front rather than accepting the first 'I can't' at face value.
- Claude claimed it couldn't verify the podiatrist's TDLR license without browser automation; you pushed back that Playwright should work, and it then succeeded and corrected its own erroneous 'expired' finding
- Claude reported it couldn't retrieve the cookbook recipe, forcing you to paste the text in manually instead of it attempting a fetch

### Wrong assumptions about external platforms and intent
Claude acted on guesses about what a target system or audience needed instead of confirming first, producing work you had to reject or redo.
- Claude stripped all markdown from publish-ready files based on a wrong assumption about LinkedIn's article editor, damaging content you had already prepared
- Claude produced a detailed technical progress agenda when you needed a light introductory meet-and-greet agenda with a co-executive, costing a full clarification round

### Auth, config, and hook failures that stall work mid-task
A large share of your friction is environmental: expired tokens, wrong paths, hung hooks, and shadowing config files that halt otherwise-complete workflows.
- The credit card statement import stalled on an expired Google OAuth token, requiring you to complete manual console steps yourself
- LinkedIn MCP registration failed repeatedly due to a wrong .env path, a permission-classifier block, and truncated pasted commands, leaving authentication pending a Claude Code restart
- The repo's pre-commit hook hung indefinitely, forcing you into --no-verify commits, and a shadowing application-test.yml caused a config debugging detour

## Suggestions

### CLAUDE.md Additions

**Verification Before Claiming Impossible** — Before saying a task can't be done, attempt it with available tooling first. Browser automation (Playwright/MCP browser tools) is available and should be tried for license lookups, public registry checks, and any web verification task. Never report a status without a verified source screenshot or quoted page text.
_Why:_ In the TDLR license session Claude declared browser verification impossible until the user pushed back, then succeeded and also corrected a wrong 'expired' claim.

**Content Publishing Rules** — Never strip or reformat markdown in publish-ready files without explicit confirmation. Ask first if a target platform's formatting is uncertain. Publishing targets (LinkedIn, etc.) have known API limits: native articles cannot be created and existing posts cannot be edited/deleted via API. Flag these as manual steps up front instead of attempting and failing.
_Why:_ Claude destructively stripped markdown from publish-ready files on a wrong assumption, and multiple LinkedIn sessions hit the same article/delete API walls.

**Git Workflow** — The pre-commit hook in this repo can hang indefinitely. If a commit stalls >60s, kill it, report it, and retry with `--no-verify`, then note the skipped checks in the PR description. Default flow for finished work: branch -> commit -> push -> open PR. Do not commit directly to main.
_Why:_ version_control_workflow was the top goal across 6 sessions and the hanging pre-commit hook already forced an undocumented `--no-verify` workaround once.

**Ask Before Assuming Audience** — For any document, agenda, post, or summary, confirm the intended audience and register (technical vs. introductory vs. executive) before drafting. One clarifying question is cheaper than a full rewrite.
_Why:_ Claude produced a technical progress agenda when the user needed a light meet-and-greet intro agenda, requiring a full redo.

**Background Jobs** — Do not schedule wakeups, polling, or reminders for jobs already tracked by the harness. Check for existing tracking before adding any monitoring.
_Why:_ Claude scheduled unnecessary wakeups for an already harness-tracked background job and had to self-correct mid-session.

### Features to Try

**Custom Skills** — Reusable prompt files you invoke with a single slash command. You already maintain skills (roast, council-review, code-review, wrap-up/session-handoff) and spent a whole session de-duplicating them — a canonical /publish and /pr skill would stop the LinkedIn and git flows from being re-derived each time.

**MCP Servers** — Connect Claude to external tools and APIs over the Model Context Protocol. Your LinkedIn MCP registration failed three times (wrong .env path, permission-classifier block, truncated pasted command) and auth was left pending — pinning the config in .mcp.json makes it reproducible instead of a manual re-paste each session.

**Hooks** — Shell commands that auto-run at Claude Code lifecycle events. With 496 Bash calls and 45 commits, plus a pre-commit hook that hangs and a shadowing application-test.yml that caused a config debugging detour, a bounded pre-commit hook would fail fast instead of stalling your session.

### Usage Patterns

**Front-load blockers instead of discovering them mid-task** — Ask Claude to enumerate external dependencies (OAuth tokens, API capability limits, manual console steps) before starting a multi-step task. Three sessions stalled on the same class of problem: expired Google OAuth, LinkedIn API refusing article creation, and LinkedIn auth pending a restart.
> Prompt: "Before you start: list every external dependency this task needs (auth tokens, API scopes, restarts, manual console steps). Test each one now with a cheap call. Give me a single batched list of anything I need to fix manually before you proceed."

**Your council/adversarial review pattern is your best tool — formalize it** — The council-review sessions produced your only two 'fully_achieved' outcomes; turn it into a standard gate for decisions.
> Prompt: "Run a council review on this plan before executing. Include one reviewer arguing it's destructive or irreversible, one arguing the audience/format assumption is wrong, and one arguing there's a simpler path. Synthesize into a verdict and list anything I must confirm before you touch files."

**Bash is 40% of your tool calls — script the repeats** — 496 Bash invocations against 45 commits and 138 reads suggests a lot of repeated git, build, and MCP-registration plumbing. Committing scripts/ wrappers makes them reproducible, reviewable, and immune to paste truncation.
> Prompt: "Scan our recent bash history and this repo. Identify the shell command sequences I run repeatedly (git flow, test runs, MCP setup, build). Write each as an idempotent script in scripts/ with a --dry-run flag, and add a short table to CLAUDE.md mapping each task to its script."

**Use Task Agents for the codebase-archaeology work** — Delegate exploration like 'find all duplicate skills' or 'why is this YAML shadowing that one' to a subagent.
> Prompt: "Use a subagent to audit .claude/skills/ and all YAML config in this repo. Report: (1) skills with overlapping purpose or duplicate trigger names, (2) any config file shadowing or overriding another, (3) a recommended consolidation. Don't change anything yet — just give me the report."

## On the Horizon

### Self-Healing Publishing Pipeline With Preflight Verification
A publishing agent that boots by verifying every credential and capability (LinkedIn auth, Google OAuth, MCP registration, pre-commit hook health), renders a fidelity diff of markdown-to-platform conversion, and only then publishes — halting with a precise remediation checklist when something is stale instead of half-completing. Store a capability matrix of what each platform's API genuinely supports as a checked-in markdown file the agent reads at the start of every run.

### Parallel Council Agents That Argue To Convergence
Spawn genuinely independent reviewer subagents in parallel — security, maintainability, product, and a dedicated red-team skeptic — each writing findings to separate files with zero knowledge of one another, then a second round where each critiques the others' findings before a synthesizer produces a ranked verdict with explicit dissents preserved. Commit the whole council transcript as an ADR.

### Overnight Agent Loops Driven By Failing Tests
Point an agent at a set of deliberately failing tests or a spec file and let it iterate — implement, run, read the failure, refine — committing only when the full suite plus lint plus typecheck all pass green, and opening a PR with a summary of what it tried and what it rejected. Run as a background job with a hard iteration cap so you review a finished branch in the morning instead of babysitting a REPL.

## Fun Ending

Claude told the user it couldn't verify a podiatrist's license without browser automation — the user pushed back that Playwright would work fine, and Claude not only pulled up the TDLR record but discovered its own earlier 'license expired' claim had been wrong the whole time. From a session that swerved from license verification straight into a genuinely useful explanation of why Epsom salt beats table salt for ingrown toenails — one of only two sessions rated fully achieved.

---

Report URL: file://C:\Users\Owner\.claude\usage-data\report-2026-08-31-171829.html
