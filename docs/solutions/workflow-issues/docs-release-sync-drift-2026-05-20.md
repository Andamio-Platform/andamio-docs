---
title: "Andamio docs site drifts from platform release cycle with no gate"
date: 2026-05-20
category: workflow-issues
module: andamio-docs/release-sync
problem_type: workflow_issue
component: documentation
severity: high
applies_when:
  - A new platform/API/CLI version ships and andamio-docs has no corresponding update PR
  - A feature lands across multiple routes (e.g., enterprise sponsorship) without a docs entry
  - Version-pinned references (CLI install lines, API version notes, state-machine versions) appear in MDX
  - A prior "sync" commit lands without a recurring re-check scheduled
  - CIP-30 / auth / JWT behavior changes ship in platform PRs without a docs checklist
tags:
  - release-sync
  - docs-drift
  - andamio-docs
  - platform-v2.3
  - version-pinning
  - release-gate
  - drift-detector
  - audit-cadence
---

# Andamio docs site drifts from platform release cycle with no gate

## Context

The v2.3 documentation audit (PR #16, branch `feat/docs-sync-v2.3`) surfaced systemic drift between `andamio-docs` and shipped platform state. Concretely:

- The CLI install example pinned `0.9.1` while `andamio-cli` had tagged `v0.12.1` — three minor versions behind.
- The state-machine note still referenced API `v2.1.1-rc12` while the gateway had moved to `v2.3.5` — two release cycles ahead.
- Enterprise sponsorship was live across 8 routes with **zero** developer-facing documentation.
- CIP-30 developer login and the JWT lifetime cut + refresh-token flow were undocumented despite being security-relevant.

Most tellingly, the prior remediation commit `51f5b93` ("sync with API v2.1.4, CLI v0.10.2") was already stale at the moment it merged — the sync was written against a moving target with no gate to anchor it. The root cause is structural: nothing ties a docs sync to the release cycle, so sync happens by ad-hoc audit, and the audit itself lags.

This is not a one-off. Earlier releases show the same pattern:

- **April 6, 2026** — the `51f5b93` cycle ran a full `ce:plan`-driven remediation (16 requirements, 6 new pages, 5 updates) and explicitly acknowledged it was *remediation, not prevention*. No gate was put in place for the next cycle.
- **May 8, 2026** — the Andamio API cut v2.3.1: version references were synced, then it was tagged, deployed, and merged, with no corresponding check of `andamio-docs`. The release process has no docs-sync step.
- **April 29, 2026** — a known polling-interval doc drift was noticed during a fix and deferred as natural cleanup for a later PR. Drift is normalized inside individual repos too.
- **May 19, 2026** — the `andamio-cli` `apikey usage`/`profile` 401 incident: the gateway moved endpoints behind `developerJWTAuth` (v2.2→v2.3), the CLI didn't follow (PR #96). Same category — downstream surfaces don't automatically learn about behavioral changes.

The April 6 plan worked for content but had no mechanism to signal when the next sync was needed. Version strings in MDX are passive drift indicators that don't self-report; they only surface when someone audits.

## Guidance

Adopt a layered approach. No single layer is sufficient — each catches a different failure mode. **Implement layer 2 first** — the drift detector pays off immediately against the current `andamio-docs` state without needing release-workflow changes.

### Layer 1 — Release-cycle hook (primary, once detector proves the signal)

When a platform release report is finalized, mechanically generate a "Public docs delta" checklist from the report's `Developer-visible`, `User-requested endpoints`, and `Security` sections. The checklist gets appended to the release report and a matching docs PR is opened against `andamio-docs` as part of the release — not after it.

Sketch (on the release side):

```bash
# emit-docs-delta.sh
REPORT="$1"   # the release report
awk '/^## (Developer-visible|User-requested endpoints|Security)/,/^## /' "$REPORT" \
  | grep -E '^- ' \
  | sed 's/^- /- [ ] Docs: /' \
  > "$2"     # the docs delta checklist
```

The docs PR is a tick-through of the checklist. Trade-off: requires release authors to keep the release report's section headers consistent — already an internal convention worth holding.

### Layer 2 — Drift detector (automated, between releases — build this first)

A script that compares authoritative version sources against version strings in `content/docs/**/*.mdx`. Authoritative sources:

- The dev-kit's version pins (`VERSIONS`) — `GATEWAY_TAG` (only this for public-docs purposes; ignore the internal services' version pins — those services are excluded from public docs).
- `git -C "$CLI_REPO" describe --tags --abbrev=0` — current CLI tag.

Sketch (run from `andamio-docs`):

```bash
# .claude/skills/audit-docs/detect-drift.sh
CLI_LATEST=$(git -C "$CLI_REPO" describe --tags --abbrev=0)        # e.g. v0.12.1
GATEWAY_LATEST=$(grep '^GATEWAY_TAG=' "$DEVKIT_REPO/VERSIONS" | cut -d= -f2)

# Find any CLI version string in docs that doesn't match latest
grep -rEn 'andamio-cli@v?[0-9]+\.[0-9]+\.[0-9]+|VERSION=[0-9]+\.[0-9]+\.[0-9]+' content/docs \
  | grep -v "${CLI_LATEST#v}" \
  || echo "CLI versions: OK"

# Find any API version pin in docs that doesn't match gateway
grep -rEn 'v2\.[0-9]+\.[0-9]+(-rc[0-9]+)?' content/docs \
  | grep -v "$GATEWAY_LATEST" \
  || echo "Gateway versions: OK"
```

Output is a checklist, **not** a hard CI fail. Hard-failing CI on every version bump punishes the wrong moment; a checklist makes drift visible without blocking unrelated docs PRs. Add an allowlist (`docs/.drift-allowlist`) for intentional historical references (e.g., changelog entries).

### Layer 3 — Scheduled audit (fallback)

A quarterly `/audit-docs` skill invocation that diffs the platform's transaction-flow docs and recent release reports against current MDX. Useful when Layer 1 is skipped under release pressure and Layer 2 is silenced by allowlist creep. Cheap insurance, not the primary mechanism.

### Scope constraint (all three layers)

Drift checks must filter to the **developer-facing surface**: gateway routes + CLI commands/flags + public auth flows. Internal services appear in the version pins and release reports but are intentionally excluded from public docs — the drift detector should pin to `GATEWAY_TAG` and CLI tags only.

### Two-surface routing

The public docs site has two surfaces with different audit owners:

- **Developer guides** (`content/docs/guides/developers/`) — operational knowledge: source field, safe refetch, billing, sponsorship. Owned by the release-sync workflow this doc defines.
- **Protocol/transaction docs** (`content/docs/protocol/v2/transactions/`, `…/validators/`, `…/tokens/`) — owned at the time by two transaction-docs skills, which synced against Atlas swagger. Both have since been removed.

A drift detector should route by file path, not by version string alone, so the right skill picks up each finding.

### Don't mirror the schema layer

The live API reference is served via Scalar from the API's reference page against the generated `openapi/swagger.json` at `https://preprod.api.andamio.io/reference`. Public docs should document concepts, flows, and developer patterns — not mirror request/response schemas, which the live reference always serves current. The drift detector should ignore schema-layer drift; only flag conceptual, version-pinned, or flow-level drift.

### Kill-switched features

When a behavior change is behind a deploy-gated kill switch (as with the CIP-30 login), document the behavior change but point to the live API reference for exact endpoint paths rather than hardcoding them. The v2.3 audit applied this pattern in `developer-accounts.mdx`. Make it a standing rule, not a one-off judgment call.

## Why This Matters

Drift in public docs is not a cosmetic problem — it's an adoption tax. Enterprise sponsorship shipped live across 8 routes with zero developer documentation; any external developer evaluating Andamio at that moment would have concluded the feature didn't exist. CIP-30 login and short JWT lifetimes are security-relevant; missing docs there don't just slow integration, they invite incorrect implementations.

The `51f5b93` pattern — "sync" commits that are already stale on merge — is the diagnostic signature of a missing gate: a human heroically catches up, the catch-up itself ages out before the next sync, and the cycle repeats. The May 8 v2.3.1 sync PR confirms the gap is in the release process itself: tag, deploy, merge, finish — with no step that touches the docs repo.

Each release without a gate compounds drift (linearly in shipped features, super-linearly in developer confusion). Each release with a gate compounds confidence: external developers learn that the docs they're reading describe the system they're calling, and the team learns that "ship" includes "documented." That trust is the actual product surface.

## When to Apply

- A platform release report is being finalized — generate the docs delta checklist as part of finalization.
- A sibling repo cuts a tag bump that crosses a minor version (e.g., `GATEWAY_TAG` moves from `v2.2.x` to `v2.3.0`, or `andamio-cli` moves from `v0.11.x` to `v0.12.0`).
- A new public-facing endpoint, CLI flag, or auth path ships — even outside a numbered release.
- Any PR titled `docs: sync …` opens — pair it with a generated delta checklist rather than free-form audit notes.
- Before publishing a `/guide-pipeline` status update — run the drift detector so the status reflects current reality.
- Quarterly, as a fallback `/audit-docs` invocation, even if no release triggered it.

## Examples

**Before (v2.3 audit, PR #16):** ad-hoc workflow. Started from a manual read of the platform's release notes. Produced an audit document, then ~9 file edits across `content/docs/`. Several changes (e.g., exact CIP-30 endpoint paths) were unverifiable from docs alone because a deploy-gated kill switch made the public surface ambiguous at audit time — the audit had to make judgment calls without a feedback loop back to the release author. Total cost: a long stretch of human attention, and the result was a point-in-time snapshot that started drifting again immediately.

**After (proposed):** the release author finalizes the v2.3 release report. A hook (or a manual `emit-docs-delta.sh` run) emits a public docs delta checklist next to it:

```markdown
# Public docs delta — v2.3

- [ ] Docs: CIP-30 developer login flow
- [ ] Docs: JWT lifetime cut + refresh-token rotation
- [ ] Docs: enterprise sponsorship — 8 routes + /tx/sponsored/submit
- [ ] Docs: update CLI install example to v0.12.1
- [ ] Docs: bump state-machine note API pin from v2.1.1-rc12 to v2.3.5
- [ ] Docs: get-qualified contributors endpoint + status semantics
```

The docs PR against `andamio-docs` is a tick-through of that file. Between releases, the drift detector catches anything the checklist missed:

```text
$ ./.claude/skills/audit-docs/detect-drift.sh
content/docs/guides/developers/cli/installation.mdx:20: VERSION=0.9.1            # expected 0.12.1
content/docs/protocol/v2/state-machine/index.mdx:261: v2.1.1-rc12                # expected v2.3.5
```

**Implementation order:**

1. Build the drift detector first — it pays off against current `andamio-docs` state immediately.
2. Add the release-cycle hook second, once the detector has proven the signal is useful.
3. Treat the scheduled audit as a backstop, not a primary mechanism.

## Related

- [PR #16 — docs: sync developer docs with v2.3 platform state](https://github.com/Andamio-Platform/andamio-docs/pull/16) — the triggering audit.
- `.claude/skills/guide-pipeline/SKILL.md` "Cross-Repo Sync" section — proves the cross-repo tracker pattern; scope is onboarding guides + UX readiness.
- The platform's v2.3 release report — the source-of-truth artifact a release-cycle hook would consume.
