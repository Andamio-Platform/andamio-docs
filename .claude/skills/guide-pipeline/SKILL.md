---
name: guide-pipeline
description: Track guide writing progress, manage blockers, and coordinate the publish pipeline for Andamio documentation guides.
---

# Guide Pipeline

Manages the end-to-end lifecycle of Andamio documentation guides — from UX readiness assessment through drafting, review, and publication.

## Commands

### `/guide-pipeline` or `/guide-pipeline status`

Display the full guide dashboard.

**Steps:**

1. Read tracker at `.claude/skills/guide-pipeline/guide-tracker.json`
2. Read connections map at `.claude/skills/guide-pipeline/guide-connections.md`
3. Display dashboard table:

```
| # | Guide | Role | UX Score | Status | Blockers | Friction |
|---|-------|------|----------|--------|----------|----------|
```

4. Show summary counts from `summary` field
5. Highlight any guides with `blocked` UX score
6. Note which guides have Scribe recordings available (check `scribeUrl` field)
7. Display onboarding path view showing guide connections and publish status:

```
Onboarding Paths:                          (status)
  Course Owner:  (1) → (2) → (3) → (4)
  Project Owner: (1) → (6) → (7)
  Contributor:   (1) → (8) → (9) → (10)
  Bridge:        (3) + (6) → (5)
```

Mark each node with its status icon: published, draft, or not-started. Flag any guide whose prereqs are not yet published.

---

### `/guide-pipeline check-blockers`

Refresh blocker and friction issue states from GitHub.

**Steps:**

1. Read tracker
2. For each guide with entries in `blockerIssues` or `frictionIssues`:
   ```bash
   gh issue view <NUMBER> --repo Andamio-Platform/andamio-app-v2 --json state,title,labels
   ```
3. Update each issue's `state` field in the tracker (`OPEN` or `CLOSED`)
4. Recalculate UX readiness scores:
   - If all blockers are `CLOSED` and guide was `blocked` → upgrade to `friction` (if friction issues remain open) or `ready`
   - If all friction issues are also `CLOSED` → set score to `ready`
5. Recalculate `summary` counts
6. Write updated tracker
7. Report what changed:
   - Issues that closed since last check
   - Guides whose UX score changed
   - Guides now unblocked for writing

---

### `/guide-pipeline write <id>`

Begin or continue writing a guide's MDX content.

**Steps:**

1. Read tracker, find guide by `id`
2. **Gate check**: If `uxReadiness.score` is `blocked`, REFUSE with message:
   > "Cannot write guide '{title}' — it has {N} open blocker issues. Run `/guide-pipeline check-blockers` or fix the issues first."
   >
   > List each open blocker with issue number and title.
3. If `uxReadiness.score` is `not-assessed`, WARN:
   > "UX readiness has not been assessed for this guide. Consider running `/ux-readiness assess {id}` from the app repo first. Proceeding anyway."
4. Check if Scribe recording exists (`scribeUrl` is not null):
   - If yes: Read the existing MDX file at `guideFile` path to check for Scribe content
   - If no: Note that manual content will be needed
5. Load guide template from `guide-template.mdx`
6. Read existing MDX file at `guideFile` to see current content
7. If `frictionIssues` exist with `OPEN` state, add a `<Callout type="warn">` at the top noting known friction points
8. Write/update the MDX file following the template pattern
9. Update tracker:
   - Set `status` to `draft`
   - Set `pipeline.draftDate` to today
   - Add history entry
10. Write tracker

---

### `/guide-pipeline review <id>`

Move a guide to review status after content check.

**Steps:**

1. Read tracker, find guide by `id`
2. Verify guide is in `draft` status (refuse if `not-started` or `published`)
3. Read the MDX file at `guideFile`
4. Read connections map at `.claude/skills/guide-pipeline/guide-connections.md`
5. Run content checklist:
   - [ ] Has frontmatter with `title` and `description`
   - [ ] Has prerequisites section linking to prereq guides per connections map
   - [ ] Has at least one walkthrough section with numbered steps
   - [ ] Has next steps section linking to next-step guides per connections map
   - [ ] Images load (if Scribe-sourced)
   - [ ] No placeholder text remaining (`{GUIDE_TITLE}`, `{STEP_TITLE}`, etc.)
   - [ ] Links to other guides use correct paths and match connections map
5. Report findings — pass or list issues to fix
6. If passing:
   - Update `status` to `review`
   - Set `pipeline.reviewDate` to today
   - Add history entry
   - Write tracker

---

### `/guide-pipeline publish <id>`

Mark a guide as published.

**Steps:**

1. Read tracker, find guide by `id`
2. Read connections map at `.claude/skills/guide-pipeline/guide-connections.md`
3. Verify guide is in `review` status
4. Verify the MDX file exists and has content
5. Check prereq guides are published — if any prereq is not yet published, WARN before proceeding
6. Check the relevant `meta.json` includes this guide's slug:
   - Read the `meta.json` in the same directory as the guide file
   - Verify the guide's filename (without `.mdx`) appears in the `pages` array
   - If missing, add it and report the addition
5. Update tracker:
   - Set `status` to `published`
   - Set `pipeline.publishDate` to today
   - Add history entry
6. Recalculate summary counts
7. Write tracker

---

### `/guide-pipeline report-issue <id>`

Create a GitHub issue in the app repo for a problem found during guide writing.

**Steps:**

1. Ask the user to describe the issue:
   - **Title**: One-line summary
   - **Severity**: `blocker` (prevents guide completion) or `friction` (guide can proceed with caveats)
   - **Description**: What happens, what should happen, which step in the guide is affected

2. Create the issue:
   ```bash
   gh issue create \
     --repo Andamio-Platform/andamio-app-v2 \
     --title "<TITLE>" \
     --body "<BODY>" \
     --label "documentation,ux-readiness"
   ```

   Body template:
   ```
   ## Context
   Found while writing guide: **{guide.title}** (`{guide.id}`)

   ## Problem
   {user description}

   ## Affected Guide Step
   {which step / route is affected}

   ## Severity
   {blocker|friction} — {explanation of impact on guide}

   ---
   Filed via `/guide-pipeline report-issue`
   ```

3. Capture the created issue number from `gh` output
4. Add to tracker:
   - If `blocker`: add to `uxReadiness.blockerIssues[]`
   - If `friction`: add to `uxReadiness.frictionIssues[]`
   - Entry shape: `{"repo": "Andamio-Platform/andamio-app-v2", "number": <N>, "title": "<TITLE>", "state": "OPEN"}`
5. Recalculate UX score:
   - If any blocker is `OPEN` → score becomes `blocked`
   - Else if any friction is `OPEN` → score becomes `friction`
6. Update summary counts
7. Write tracker
8. Report: "Issue #{N} created. Guide '{title}' is now {score}."

---

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| `scribe-walkthrough` | Guides with Scribe recordings reference the same content. Check `scribeUrl` and `walkthrough-tracker.json` for recording status. |
| `v2-docs-audit` | Complementary tracker — guides link to protocol docs as references |
| `glossary-game` | Terminology questions during guide writing delegate to glossary-game |
| `ux-readiness` (app repo) | Cross-repo partner. Writes UX assessment results to this tracker. Run `/ux-readiness assess <id>` from the app repo to update readiness scores. |

## Cross-Repo Sync

The `guide-tracker.json` in this directory is the shared source of truth. The `ux-readiness` skill in the app repo (`$REPOS/andamio-app-v2`) reads and writes to this file via absolute filesystem path.

- Changes from the app repo appear as unstaged modifications here — commit them during your next docs session
- Issue states are always verified live via `gh issue view`
- Only one Claude session operates at a time, so no concurrent conflicts

This skill handles the onboarding-guides surface specifically. The broader pattern (docs drift relative to the platform release cycle) is captured in `docs/solutions/workflow-issues/docs-release-sync-drift-2026-05-20.md`, with the version-pin drift detector at `npm run docs-drift` (`.claude/skills/audit-docs/`). Before publishing a pipeline status update, run the drift detector so status reflects current reality.

## Tracker Schema Reference

```jsonc
{
  "id": "string",           // kebab-case identifier
  "title": "string",        // Human-readable guide title
  "role": "string",         // general | courses | projects | contributors
  "guideFile": "string",    // Relative path to MDX file from docs repo root
  "description": "string",  // One-line description
  "status": "string",       // not-started | draft | review | published
  "uxReadiness": {
    "score": "string",      // not-assessed | blocked | friction | ready
    "lastAssessed": "date|null",
    "appRoutes": ["string"],  // App routes this guide covers
    "blockerIssues": [        // Prevent guide writing
      {"repo": "string", "number": 0, "title": "string", "state": "OPEN|CLOSED"}
    ],
    "frictionIssues": [       // Guide can proceed with caveats
      {"repo": "string", "number": 0, "title": "string", "state": "OPEN|CLOSED"}
    ]
  },
  "pipeline": {
    "draftDate": "date|null",
    "reviewDate": "date|null",
    "publishDate": "date|null"
  },
  "scribeUrl": "string|null",
  "history": ["string"]       // Timestamped log entries
}
```

---

**Last Updated**: February 8, 2026
