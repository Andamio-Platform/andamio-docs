---
title: "fix: Align CLI docs page with the Andamio CLI 1.0 command surface"
status: active
date: 2026-07-27
type: fix
origin: https://github.com/Andamio-Platform/andamio-docs/issues/64
depth: lightweight
---

# fix: Align CLI docs page with the Andamio CLI 1.0 command surface

## Summary

Andamio CLI 1.0 scoped the tool to the **Owner, Teacher and Manager** roles and removed the
`andamio course student ...` and `andamio project contributor ...` command groups. The published
CLI overview page still documents both groups as working commands, and it misses two 1.0 additions
to the teacher surface plus the new scripting/exit-code contract.

This plan edits one file — `content/docs/apps-tooling/cli/index.mdx` — to remove the retired
sections, point learners and contributors at the Andamio app, and cover the 1.0 teacher and
scripting surface.

---

## Problem Frame

A reader following the CLI page runs `andamio course student submit` and hits a retirement error
(exit code 4). The CLI itself handles the failure gracefully — it names the removal and points at
`https://app.andamio.io` — but the docs are what sent the reader there. The docs page is the last
thing in the chain still asserting these commands work.

Upstream: `Andamio-Platform/andamio-cli#130` tracks `andamio-cli#127` ("help text and docs describe
the 1.0 surface"), which cannot close until this docs change lands.

---

## Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| R1 | The `### Course Student` and `### Project Contributor` sections are removed from the CLI overview page | Issue #64 "Done when" |
| R2 | A pointer to the Andamio app replaces them, explaining that learner and contributor work happens there in one signed flow | Issue #64 "Done when" |
| R3 | No published CLI page documents a removed command as working | Issue #64 "Done when" |
| R4 | The teacher surface covers `andamio teacher assessment build` and the `content.evidence_text` field on `teacher assignments list` / `get` | Issue #64 "Worth adding" |
| R5 | The page carries an exit-code / scripting entry point (`andamio help exit-codes`, CLI README `Scripting`) | Issue #64 "Worth adding" |

---

## Verified Facts from the CLI Source

Research against the `andamio-cli` repo (branch `feat/cli-1-0-release-scope`) confirms the scope:

- `cmd/andamio/retired.go` is the single source of truth for retirements. It lists two groups and
  their subcommands: `course student` (`courses`, `credentials`, `commitments`, `commitment`,
  `create`, `submit`, `update`, `leave`, `claim`) and `project contributor` (`list`, `commitments`,
  `commitment`, `commit`, `update`, `delete`). Retired commands stay registered but hidden, and fail
  with a typed `RemovedCommandError` carrying the app guidance URL.
- Everything else the docs page documents still exists: `course owner list|create`,
  `course teacher register-module|publish-module|review|commitments`, `course create-module`,
  `course import-all`, `project owner list|create`, `project task list|create|export|verify-hash`,
  `project manager commitments`, `teacher courses`, `tx run|build|sign|submit|register`. **No rows
  outside the two retired sections need changing.**
- `teacher assessment build` exists (`cmd/andamio/teacher_assessment_test.go`, README `andamio teacher`
  section) and stops at the unsigned transaction so a person reviews decisions before signing.
- `teacher assignments list|get` returns `content.evidence_text` (Markdown) alongside the raw Tiptap
  `content.evidence`.
- `andamio help exit-codes` ships in the binary (`cmd/andamio/exitcodes_help.go`); the exit-code
  table (0 success, 1 error/server/backpressure/canceled, 2 not_found, 3 auth, 4 removed_command,
  5 unreachable, 6 conflict) lives in the CLI README `Scripting` section.

**Not in scope** (confirmed correct as they stand, per issue #64 and a repo-wide grep):
`content/docs/apps-tooling/andamio-app/roles.mdx` and `explore-getting-started.mdx` (they describe
the app, where this work now lives), `public/yaml/transactions/v2/course/student/**` and
`project/contributor/**` (the API routes are **not** retired — 1.0 removed CLI commands, not gateway
endpoints), and `docs/reference/GLOSSARY.md`. A grep for `andamio course student` /
`andamio project contributor` across `content/` returns hits only in
`content/docs/apps-tooling/cli/index.mdx`, satisfying R3 with a single-file edit.

---

## Key Technical Decisions

**KTD1 — Remove, don't rewrite.** The two sections are deleted rather than annotated as deprecated.
A deprecation table still reads as a command reference; a sentence pointing at the app is the useful
replacement. (Issue #64 states this directly.)

**KTD2 — One prose pointer, not a table.** The replacement is a short paragraph under a heading that
names the audience ("Learners and contributors"), linking to `https://app.andamio.io`. Matches the
CLI's own retirement message so a reader who hit the error and a reader who reads the docs land in
the same place. App links elsewhere in these docs use `mainnet.app.andamio.io` in app-specific pages
and `app.andamio.io` in tool pages (`andamio-dev.mdx`, `andamio-app/demo.mdx`); use `app.andamio.io`
to match the CLI's error text verbatim.

**KTD3 — Scripting section links out, does not mirror the table.** The docs page's stated posture is
that the `andamio-cli` repo is the source of truth and "the rest of this page is a quick orientation."
Copying the seven-row exit-code table here creates a second thing to keep in sync. Instead: a short
section naming `--output json` as the stable surface, `andamio help exit-codes` as the in-binary
contract, and a link to the README `Scripting` section. This also keeps `npm run docs-drift` surface
area from growing.

**KTD4 — Teacher additions go in the existing table plus one clarifying note.** `teacher assessment
build` is a row in the `Course Owner and Teacher` table; `content.evidence_text` is not a command and
gets a one-sentence note under the table rather than a fake command row.

---

## Scope Boundaries

**In scope:** `content/docs/apps-tooling/cli/index.mdx` only.

**Non-goals:**
- App pages (`andamio-app/roles.mdx`, `explore-getting-started.mdx`) — correct as written.
- V2 transaction YAML specs under `public/yaml/transactions/v2/course/student/` and
  `project/contributor/` — the API routes are live.
- `docs/reference/GLOSSARY.md` role definitions.
- `content/docs/apps-tooling/cli/import-format.mdx` — unaffected by 1.0 scoping.

### Deferred to Follow-Up Work
- Any broader `docs-drift` rule that pins the CLI page against the CLI's command registry. Worth
  doing, but it is tooling work in `scripts/`, not this issue.

---

## Implementation Units

### U1. Remove the retired learner and contributor sections and point at the app

**Goal:** Satisfy R1, R2, R3 — the page stops documenting removed commands and tells readers where
that work lives.

**Requirements:** R1, R2, R3

**Dependencies:** none

**Files:**
- `content/docs/apps-tooling/cli/index.mdx` (modify)

**Approach:**
- Delete the `### Course Student` heading and its table (currently lines ~51–59).
- Delete the `### Project Contributor` heading and its table (currently lines ~73–81).
- Add one short section in their place — placed once, after `### Project Owner and Manager`, not
  duplicated in both slots — with a heading naming the audience and a sentence explaining that
  enrolling, submitting evidence, committing to tasks, and claiming credentials happen in the Andamio
  app, which signs and submits in one flow, linking `https://app.andamio.io`.
- Mention that CLI 1.0 scoped the tool to Owner, Teacher and Manager so a returning reader
  understands why a command they used before is gone.
- Do not touch the surrounding `Browse and Query`, `Authentication`, `Course Owner and Teacher`,
  `Project Owner and Manager`, or `Transactions` sections — all their rows are verified live in 1.0.

**Patterns to follow:** Existing section shape on this page — `###` heading, then either a two-column
`| Task | Command |` table or short prose. App-link style matches
`content/docs/apps-tooling/andamio-dev.mdx:106`.

**Test scenarios:**
- `grep -nE "andamio (course student|project contributor)" content/docs/apps-tooling/cli/index.mdx`
  returns nothing.
- Repo-wide: `grep -rnE "andamio (course student|project contributor)" content/` returns nothing.
- The rendered page still contains the four retained `###` sections and the new pointer section.
- `grep 'apps-tooling/cli/index' .content-collections/generated/allDocs.js` still matches after a
  build — frontmatter is untouched, but MDX files with broken frontmatter are silently dropped, so
  confirm rather than assume.

**Verification:** The page builds, the two sections are gone, and a reader who lands on the CLI page
looking for enrollment or task-commitment finds a link to the app instead of a command that errors.

---

### U2. Cover the 1.0 teacher surface additions

**Goal:** Satisfy R4 — `teacher assessment build` and `content.evidence_text` appear on the page.

**Requirements:** R4

**Dependencies:** U1 (same file; sequence to keep the diff readable)

**Files:**
- `content/docs/apps-tooling/cli/index.mdx` (modify)

**Approach:**
- Add a row to the `### Course Owner and Teacher` table for
  `andamio teacher assessment build --course-id <id> --alias <you> --decision <student>=accept`,
  described as building the assessment transaction without signing or submitting it.
- Add a one- or two-sentence note under that table covering: `teacher assignments list` / `get`
  return the learner's submission as Markdown in `content.evidence_text` (raw Tiptap stays in
  `content.evidence`), and that `assessment build` stops at the unsigned transaction so `tx sign` /
  `tx submit` remain separate steps while `tx run` still does the full lifecycle.
- Keep the flag examples consistent with the CLI README's `andamio teacher` section rather than
  inventing shorthand.

**Patterns to follow:** Existing table rows on this page use backticked full invocations with
angle-bracket placeholders (`<id>`, `<hash>`). The `### Transactions` section already frames
`tx build → tx sign → tx submit → tx register`, so the note should point at it rather than restate it.

**Test scenarios:**
- The page contains `teacher assessment build` and `content.evidence_text`.
- The command string on the page matches the flag names used in the CLI README `andamio teacher`
  section (`--course-id`, `--alias`, `--decision`).
- No new command row references a path in `cmd/andamio/retired.go`.

**Verification:** A teacher reading only this page knows an assessment can be built and reviewed
before signing, and knows where to read a submission as prose.

---

### U3. Add a scripting and exit-codes entry point

**Goal:** Satisfy R5 — the page tells a scripting reader the contract exists and where it lives.

**Requirements:** R5

**Dependencies:** U1, U2 (same file)

**Files:**
- `content/docs/apps-tooling/cli/index.mdx` (modify)

**Approach:**
- Add a short `## Scripting` section after `## Quick Start` (before `## Full Documentation`).
- Cover three points, briefly: `--output json` is the stable surface (data to stdout, progress and
  errors to stderr, nothing reads stdin or needs a TTY); every failure carries an exit code and a
  `kind` field from the same classification; an empty result set is exit 0, not an error.
- Link `andamio help exit-codes` as the in-binary contract and the CLI README
  [`Scripting`](https://github.com/Andamio-Platform/andamio-cli/blob/main/README.md#scripting)
  section as the full table. Per KTD3, do not reproduce the seven-row table here.
- Optionally include the short discover-ids-then-use-them shell snippet as a fenced `bash` block,
  matching the existing `## Quick Start` block style.

**Patterns to follow:** `## Quick Start` on this page for fenced-bash style; the page's stated
"repo is the source of truth, this page is a quick orientation" posture (lines 11–13) for how much
to say before linking out.

**Test scenarios:**
- The page contains `andamio help exit-codes` and a link to the CLI README `Scripting` anchor.
- The page does not contain a reproduced exit-code table (drift surface stays flat).
- Any fenced code block is tagged `bash` and closes correctly (unclosed fences break MDX parsing).

**Verification:** A reader wiring the CLI into CI can tell from this page that `--output json` plus
exit codes is a supported contract, and gets to the full table in one click or one command.

---

### U4. Build verification

**Goal:** Confirm the edited page still compiles and routes.

**Requirements:** R1–R5 (verification only)

**Dependencies:** U1, U2, U3

**Files:**
- none (verification only)

**Approach:** Run `npm run build`. Content-collections silently drops MDX files with invalid
frontmatter — no build error, just a 404 — so also confirm the page is present in the generated
collection.

**Test expectation:** none — verification unit, no behavioral change of its own.

**Verification:**
- `npm run build` succeeds.
- `grep 'apps-tooling/cli/index' .content-collections/generated/allDocs.js` matches.
- `npm run docs-drift` reports no new drift attributable to this change.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Deleting a table row that documents a still-live command | Every retained row was checked against the CLI's cobra `Use:` strings and `cmd/andamio/retired.go`; only the two retired groups are touched |
| MDX build silently drops the page after edits | U4 greps `.content-collections/generated/allDocs.js` rather than trusting a clean build |
| The scripting section drifts from the CLI's exit-code table | KTD3 links out instead of copying the table |
| Reader assumes the API routes were retired too | The removal note is scoped to the CLI and points at the app; no protocol or YAML content is touched |

---

## Sources & Research

- Issue: `Andamio-Platform/andamio-docs#64`
- CLI retirement registry: `andamio-cli` `cmd/andamio/retired.go`, `cmd/andamio/retired_test.go`
- CLI 1.0 command surface: `andamio-cli` `README.md` (`Scripting`, `Commands`), `CHANGELOG.md`
- Exit-code help topic: `andamio-cli` `cmd/andamio/exitcodes_help.go`
- Docs conventions: `.claude/CLAUDE.md` (MDX gotchas, external API docs posture),
  `.claude/skills/docs-governance/SKILL.md` (tools hang off products; CLI lives in Apps & Tooling)
