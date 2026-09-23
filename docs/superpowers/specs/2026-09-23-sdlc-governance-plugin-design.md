# sdlc-governance plugin — design spec

**Date:** 2026-09-23
**Status:** Draft, pending user review
**Origin:** Extraction of the role-based SDLC governance system built up in the FreightClub project (`CLAUDE.md`, `docs/roles/*.md`, `.claude/rules/*.md`, hooks) into a reusable Claude Code plugin for a new, unstarted project.

## Goal

A Claude Code plugin (`sdlc-governance`) that, when installed and run once against a fresh project, scaffolds that project's own governance layer: `CLAUDE.md`, `docs/roles/*.md` (6 roles), `.claude/rules/*.md`, `docs/standards/Definition_of_Done.md` / `Definition_of_Ready.md`, and two hooks — producing a working Sequential-Lock/CHG-escalation SDLC system in the target repo without hand-copying and find-replacing FreightClub's files.

## Non-goals

- Not trying to make this multi-project-shareable beyond the user's own future projects (no public marketplace submission, no org-wide policy).
- Not porting FreightClub's persona design systems, Jira integration, or any FreightClub-specific business content — those are this project's actual product, not process.
- Not building the "full interactive wizard" (Approach C from brainstorming) that generates bespoke conditional content per answer — the target project's files use `{{PLACEHOLDER}}` markers the user fills in directly, not generated bespoke prose.
- Not solving where the plugin itself is published/distributed from long-term (see Open Questions) — just needs to be locally usable via a directory-source marketplace entry for now.

## Architecture

```
sdlc-governance/                      (plugin repo root)
├── .claude-plugin/
│   └── plugin.json                   name, version, skills path
├── skills/
│   └── sdlc-init/
│       └── SKILL.md                  the /sdlc-init skill — asks setup questions, writes target files
├── templates/
│   ├── CLAUDE.md.template
│   ├── roles/
│   │   ├── ARCHITECT.md
│   │   ├── CODER.md
│   │   ├── REVIEWER.md
│   │   ├── LIBRARIAN.md
│   │   ├── BUSINESS_ANALYST.md
│   │   └── HUMAN_FACTORS_DESIGNER.md
│   ├── rules/
│   │   ├── change-request-protocol.md
│   │   ├── testing_standards.md.template
│   │   ├── workflow.md
│   │   └── postgres-native.md.template   (only copied if multi-tenant=yes)
│   ├── standards/
│   │   ├── Definition_of_Done.md.template
│   │   └── Definition_of_Ready.md.template
│   └── hooks/
│       └── block-raw-search-tools.sh     (verbatim, stack-agnostic)
└── README.md
```

Plain markdown/shell files, not code-generated — `{{PLACEHOLDER}}` tokens the skill substitutes via simple string replacement when it writes each file into the target project.

## Component: `/sdlc-init` skill

**Flow:**
1. Confirm target is a git repo (offer `git init` if not — matches existing FreightClub convention for `/code-review ultra`).
2. Ask setup questions via `AskUserQuestion` (one round, all at once where independent):
   - Backend/frontend stack (default: Spring Boot/Java + React/TS, since that's the common case for this user; free-text override).
   - Multi-tenant? (y/n) — gates whether `postgres-native.md` (RLS/tenant-isolation rules) is copied at all.
   - Coverage target (branch %, default 65% floor / 80% aspirational — same two-number pattern as FreightClub, since "ratchet toward a target" is a valid pattern regardless of the actual number).
   - Team size: solo vs team — gates whether Jira-related sections in `LIBRARIAN.md`/`BUSINESS_ANALYST.md` are included (default: omitted, solo).
3. Write each template file into the target project's real paths (`CLAUDE.md`, `docs/roles/*.md`, etc.), substituting placeholders (project name, stack, coverage numbers, tenancy toggle content).
4. Copy `block-raw-search-tools.sh` into `.claude/hooks/` and merge a `PreToolUse:Bash` hook entry into the target's `.claude/settings.json` (creating it if absent) — reusing the same merge-don't-replace approach as the `update-config` skill.
5. Print a summary: files written, what was skipped (e.g., "multi-tenancy rules skipped — not selected"), and a reminder to run `git add`/commit.

**Idempotency:** if `CLAUDE.md` or `docs/roles/` already exist in the target, ask before overwriting (never silently clobber existing project content) — mirrors the "read before write" verification habit already established as a standing practice.

## Content inventory — what transforms how

| Source (FreightClub) | Plugin template | Transform |
|---|---|---|
| `CLAUDE.md` (role-based operating context, Sequential Lock, brevity mandate, git enforcement) | `CLAUDE.md.template` | Strip FreightClub name/domain/persona references; keep Sequential Lock Protocol, CHG escalation trigger, git branch enforcement, autonomy/escalation split verbatim as the structural core |
| `docs/roles/ARCHITECT.md` | `roles/ARCHITECT.md` | Strip FreightClub schema examples; keep Input Acceptance Gate pattern, Platform Reuse Check |
| `docs/roles/CODER.md` | `roles/CODER.md` | Strip FreightClub-specific file paths; keep Red-Green-Refactor mandate, no-Lombok-equivalent-convention slot, Input Acceptance Gate |
| `docs/roles/REVIEWER.md` | `roles/REVIEWER.md` | Strip FreightClub RLS-specific hard gates; keep hard-gate table structure (data-testid, no-mocks-for-external-config, etc.) with stack-appropriate defaults |
| `docs/roles/LIBRARIAN.md` | `roles/LIBRARIAN.md` | Strip Jira specifics unless team=team; keep CHG-### ticket template, Technical Debt Ledger pattern |
| `docs/roles/BUSINESS_ANALYST.md` | `roles/BUSINESS_ANALYST.md` | Strip Jira parity mandate unless team=team; keep INVEST standard |
| `docs/roles/HUMAN_FACTORS_DESIGNER.md` | `roles/HUMAN_FACTORS_DESIGNER.md` | Strip FreightClub persona design systems entirely; keep "HFD gate before frontend work," "PROHIBITED from finalizing UI design until BA has provided Business Rules" |
| `.claude/rules/change-request-protocol.md` | `rules/change-request-protocol.md` | Verbatim (fully generic) |
| `.claude/rules/workflow.md` | `rules/workflow.md` | Verbatim (fully generic) |
| `.claude/rules/testing_standards.md` | `rules/testing_standards.md.template` | Keep CRAP-score gate reasoning and process-efficiency guidance (targeted vs full test runs); templatize coverage numbers and Docker-specific commands |
| `.claude/rules/postgres-native.md` | `rules/postgres-native.md.template` | Copied only if multi-tenant=yes; keep RLS policy pattern, strip FreightClub table names |
| `docs/standards/Definition_of_Done.md` | `standards/Definition_of_Done.md.template` | Templatize coverage %, keep gate structure |
| `docs/standards/Definition_of_Ready.md` | `standards/Definition_of_Ready.md.template` | Templatize |
| `.claude/hooks/block-raw-search-tools.sh` | `hooks/block-raw-search-tools.sh` | Verbatim — stack-agnostic already |
| `.claude/hooks/check-deploy-script-duplication.sh` | *(not ported)* | Tied to a specific past incident that hasn't happened in the new project; user can re-derive the pattern if/when it does |
| Jira integration, persona design systems, Story_ID_to_Jira_Mapping | *(not ported)* | FreightClub-specific business content |

## Testing / validation plan

- Dry-run the `/sdlc-init` skill against a throwaway scratch directory (`git init` a temp folder) before considering the plugin done — confirm every templated file lands, placeholders are actually substituted (no leftover `{{...}}` in output), and the hook merge doesn't clobber an existing `settings.json`.
- Re-run against a directory that already has a `CLAUDE.md` to confirm the overwrite-confirmation path works.

## Open questions

1. **Where does the plugin repo live?** Needs its own directory/git repo, separate from FreightClub (e.g. `C:\projects\sdlc-governance-plugin`). Not yet created.
2. **Distribution mechanism:** for now, a local `directory` or `git` marketplace source is enough (per-machine reuse); decide later if this should move to a real GitHub repo for cross-machine reuse.
3. **Exact default coverage numbers and stack placeholder syntax** — left to the implementation plan rather than pinned here, since they're mechanical choices, not design decisions.

## Success criteria

Running `/sdlc-init` in a brand-new empty git repo produces a working `CLAUDE.md` + `docs/roles/` + `.claude/rules/` + `.claude/hooks/block-raw-search-tools.sh` (wired into `settings.json`) with no FreightClub-specific content and no unfilled placeholders, in one pass, without the user hand-editing anything beyond the setup questions they were already asked.
