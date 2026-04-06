---
title: "feat: Docs audit remediation — sync with API v2.1.4, CLI v0.10.2, and andamio-dev onboarding"
type: feat
status: completed
date: 2026-04-06
---

# Docs Audit Remediation

## Overview

Cross-repo audit found that andamio-docs is missing or stale on ~19 topics across three source repos: andamio-api (v2.1.4, ~120 endpoints), andamio-cli (82 commands), and andamio-dev (onboarding course). This plan addresses all HIGH and MEDIUM priority gaps through new pages and targeted updates to existing pages.

## Problem Frame

Developers building on Andamio hit gaps when the docs don't reflect the current API surface. The billing system, developer auth flow, API key self-service, CLI transaction pipeline, and several critical runtime concepts (source field, safe refetch timing, failure recovery) are either undocumented or incomplete. The andamio-dev course teaches these concepts in depth but that knowledge hasn't flowed into the public docs.

## Requirements Trace

- R1. Document billing system and pricing tiers (pioneer/starter/growth/enterprise)
- R2. Document developer auth flow (email/password registration, email verification, Developer JWT)
- R3. Document API key self-service endpoints (request, rotate, delete, profile, usage)
- R4. Document CLI tx commands: `tx run` (full pipeline), individual step commands, `tx types`
- R5. Document source field architecture (`merged`/`chain_only`/`db_only`)
- R6. Document "updated is the only safe refetch point" with failure scenarios
- R7. Document access token verification endpoints
- R8. Document event query endpoints and merged data concept
- R9. Document five TX failure modes with specific recovery actions
- R10. Document commitment state expiry exceptions (PENDING_TX_COMMIT, PENDING_TX_LEAVE)
- R11. Document hash verification CLI commands (compute-hash, verify-hash)
- R12. Document Attestation JWT as third credential type
- R13. Document CLI exit codes for scripting
- R14. Update API integration page with full endpoint taxonomy including billing, events, merged, token registry
- R15. Update authentication page to cover all three credential types and Developer JWT
- R16. Add dev environment URLs to reference/environments

## Scope Boundaries

- Protocol docs (validators, tokens, state machines) are NOT in scope — they have their own audit skill
- SDK docs are NOT in scope — no changes detected in SDK
- Whitepaper, pioneers, and course/project platform guides are NOT in scope
- We do NOT document individual request/response schemas — that's the live Swagger docs' job
- We do NOT add student/contributor CLI subcommands (low priority, can follow later)

## Context & Research

### Relevant Code and Patterns

- MDX frontmatter: `title` + `description` only (no icon except index pages)
- Every page: H1 matching title, 1-2 sentence intro, tables for reference, code blocks with language tags, "Next Steps" section at bottom
- Navigation: add slug to parent `meta.json` `pages` array — treat as atomic pair with MDX file creation
- Available components: `<Callout type="info|warn">`, `<Cards>`/`<Card>`, `<Steps>`/`<Step>`, `<ThemedImage>`, `<Mermaid>`
- Internal links use absolute paths from `/docs/` root
- All code examples use preprod by default

### Institutional Learnings

- **Broken directory links** (`docs/solutions/integration-issues/fumadocs-broken-directory-links.md`): Single-child directories should NOT get an index.mdx — direct-link to the child. Always update meta.json atomically with MDX creation.
- **New section checklist** (`docs/solutions/integration-issues/nextjs-fumadocs-pdf-static-asset-serving.md`): Create MDX → update meta.json → grep for cross-references → fix stale status text → match sibling style → verify in dev.
- **Stripe billing pattern** (`andamio-app-v2/docs/solutions/architecture/stripe-redirect-billing-integration-pattern.md`): 7+ subscription statuses, redirect-based flow, config-driven UI.
- **CLI wallet auth flow** (`andamio-app-v2/docs/solutions/architecture/cli-wallet-auth-standalone-page-pattern.md`): OAuth device flow adapted for Cardano wallet, CLI opens browser to `/auth/cli`.
- **TX state machine pattern** (`andamio-cli/docs/solutions/architecture/cli-tx-state-machine-pattern-and-task-hash-verification.md`): Canonical 5-step pattern. No command should combine on-chain tx with off-chain API calls.
- **V1 vs V2 auth** (`andamio-api/docs/solutions/integration-issues/cli-api-auth-middleware-mismatch.md`): V1 accepts either header (sending both = 400). V2 requires API key always, JWT optional.

## Key Technical Decisions

- **New pages vs updates**: Create 6 new pages, update 5 existing pages. Rationale: billing, developer auth, API keys, and API concepts each warrant standalone pages. TX commands and failure modes extend existing pages.
- **Developer guides section for API concepts**: Source field and safe refetch go under `guides/developers/` (not `protocol/`) because they are developer-facing operational knowledge, not protocol specification.
- **Separate billing page**: Billing is a new developer concern distinct from auth or API integration. It gets its own page.
- **Expand error-handling rather than new page**: The existing error-handling page is the right home for failure modes and commitment expiry. Expanding it avoids fragmenting related content.
- **CLI transactions page update, not rewrite**: The existing `transaction-signing.mdx` already covers the 4-step pipeline well. Add `tx run`, `tx types`, `tx status`, `tx pending`, and exit codes.

## Open Questions

### Resolved During Planning

- **Where does billing go?** → New page `guides/developers/billing.mdx`, added after `error-handling` in developers meta.json with a separator. Billing is a developer-facing API concern.
- **Developer auth: new page or extend existing?** → New page `guides/developers/developer-accounts.mdx`. The existing auth page is wallet-focused and already long. Developer email/password auth is a separate flow.
- **Where do API concepts (source field, safe refetch) go?** → New page `guides/developers/api-concepts.mdx`. These cross-cutting concepts don't fit neatly into any existing page.

### Deferred to Implementation

- Exact wording of Callout boxes for critical warnings (e.g., "updated is the only safe refetch point") — will calibrate against sibling page tone
- Whether to add Mermaid diagrams for the three-credential model or keep it as a table — will decide based on visual clarity during writing

## Implementation Units

### Phase 1: New Pages (6 new MDX files)

- [ ] **Unit 1: Developer Accounts page**

  **Goal:** Document the developer email/password auth flow, email verification, and Developer JWT

  **Requirements:** R2, R12

  **Dependencies:** None

  **Files:**
  - Create: `content/docs/guides/developers/developer-accounts.mdx`
  - Modify: `content/docs/guides/developers/meta.json`

  **Approach:**
  - Cover: developer registration, login, email verification magic link, Developer JWT (issuer/audience validation), Attestation JWT (RS256, ~10 min lifetime, offline verification)
  - Present the three-credential mental model: API Key ("who's asking"), User JWT ("who's acting"), Attestation JWT ("prove it offline")
  - Include table of all developer auth endpoints with methods, paths, and auth requirements
  - Add to meta.json after `authentication` (wallet auth comes first, developer accounts second)

  **Patterns to follow:**
  - `content/docs/guides/developers/authentication.mdx` — structure, frontmatter, heading style
  - Use `<Callout type="info">` for the three-credential mental model

  **Test scenarios:**
  - Page renders at `/docs/guides/developers/developer-accounts`
  - Sidebar shows it after Authentication
  - All internal links resolve

  **Verification:**
  - `npm run build` succeeds with increased page count
  - Content covers registration → verification → login → JWT usage flow

- [ ] **Unit 2: API Keys page**

  **Goal:** Document API key self-service: request, rotate, delete, profile, usage

  **Requirements:** R3

  **Dependencies:** Unit 1 (references developer auth)

  **Files:**
  - Create: `content/docs/guides/developers/api-keys.mdx`
  - Modify: `content/docs/guides/developers/meta.json`

  **Approach:**
  - Cover all 6 apikey endpoints with methods, paths, auth requirements
  - Note that key creation/rotation require verified email
  - Include CLI equivalents (`andamio apikey profile`, `andamio apikey usage`)
  - Add to meta.json after `developer-accounts`

  **Patterns to follow:**
  - `content/docs/guides/developers/api-integration.mdx` — table-heavy reference style

  **Test scenarios:**
  - Page renders at `/docs/guides/developers/api-keys`
  - Links to developer-accounts for prerequisite auth

  **Verification:**
  - All 6 endpoints documented with method, path, auth requirement, and purpose

- [ ] **Unit 3: Billing & Pricing page**

  **Goal:** Document billing system, pricing tiers, and subscription management

  **Requirements:** R1

  **Dependencies:** Unit 2 (references API keys and developer accounts)

  **Files:**
  - Create: `content/docs/guides/developers/billing.mdx`
  - Modify: `content/docs/guides/developers/meta.json`

  **Approach:**
  - Pricing tiers table: pioneer (free), starter ($29/mo), growth ($129/mo), enterprise (custom) with quotas (monthly, daily, per-min, per-sec, max keys)
  - Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
  - Billing endpoints: plans (public), checkout, portal, status, webhook
  - Subscription status mapping (active, past_due, canceled, etc.)
  - Add to meta.json after `api-keys` with a `"--- Platform ---"` separator before it

  **Patterns to follow:**
  - Use tables for tier comparison (like the error codes table in `error-handling.mdx`)

  **Test scenarios:**
  - Page renders at `/docs/guides/developers/billing`
  - Tier table is accurate against `andamio-api/internal/config/config.yaml`

  **Verification:**
  - All 4 tier quotas documented
  - All billing endpoints documented
  - Rate limit headers explained

- [ ] **Unit 4: API Concepts page**

  **Goal:** Document the source field architecture and "updated is the only safe refetch point"

  **Requirements:** R5, R6, R8

  **Dependencies:** None (references existing transaction and error-handling pages)

  **Files:**
  - Create: `content/docs/guides/developers/api-concepts.mdx`
  - Modify: `content/docs/guides/developers/meta.json`

  **Approach:**
  - **Source field**: Explain `merged`, `chain_only`, `db_only` values. Why they exist (dual-store architecture). How to branch on them. Future multi-API implications.
  - **Safe refetch timing**: `confirmed` ≠ safe to read. `updated` = on-chain confirmed + off-chain synced. Include the concrete failure scenario from andamio-dev M400.2 (teacher accepts while sync in progress → wrong student state).
  - **Merged endpoints**: Brief explanation that 27 endpoints combine DB + Andamioscan data. User dashboard endpoint. Link to live Swagger for full list.
  - **Event queries**: Brief explanation of 16 event endpoints (`/v2/events/{type}/{action}/{tx_hash}`). Link to Swagger.
  - Add to meta.json after `api-integration` (these are intermediate API concepts)

  **Patterns to follow:**
  - `content/docs/guides/developers/transactions.mdx` — conceptual explanation with code examples
  - Use `<Callout type="warn">` for the safe refetch timing warning

  **Test scenarios:**
  - Source field explanation covers all three values with when/why
  - Safe refetch warning is prominently placed with concrete failure scenario
  - Event endpoint pattern is clear without listing all 16

  **Verification:**
  - Developers can determine from this page when it's safe to read data after a transaction

- [ ] **Unit 5: Access Token Verification page**

  **Goal:** Document cryptographic ownership verification for third-party developers

  **Requirements:** R7

  **Dependencies:** Unit 1 (references auth concepts)

  **Files:**
  - Create: `content/docs/guides/developers/access-token-verification.mdx`
  - Modify: `content/docs/guides/developers/meta.json`

  **Approach:**
  - Two endpoints: `POST /v2/verify/session` (start challenge), `POST /v2/verify/complete` (verify ownership)
  - Use case: 3rd-party app verifies a user owns an Andamio Access Token without needing their wallet connection
  - Flow: start session → user signs challenge → verify signature → receive confirmation
  - Add to meta.json after `api-concepts`

  **Patterns to follow:**
  - `content/docs/guides/developers/authentication.mdx` — challenge/verify flow pattern

  **Test scenarios:**
  - Page clearly explains the use case (when would you use this vs regular auth)
  - Both endpoints documented with purpose and auth requirements

  **Verification:**
  - A developer integrating Andamio identity into their app can understand the verification flow

- [ ] **Unit 6: CLI Hash Verification page**

  **Goal:** Document compute-hash and verify-hash commands for courses and tasks

  **Requirements:** R11

  **Dependencies:** None

  **Files:**
  - Create: `content/docs/guides/developers/cli/hash-verification.mdx`
  - Modify: `content/docs/guides/developers/cli/meta.json`

  **Approach:**
  - Four commands: `course credential compute-hash`, `course credential verify-hash`, `project task compute-hash`, `project task verify-hash`
  - Explain Blake2b-256 hashing (matches Plutus validators)
  - compute-hash is local (no auth needed) — useful for CI/CD
  - verify-hash compares local vs API-stored hashes — diagnostic tool
  - Add to cli meta.json after `transaction-signing`

  **Patterns to follow:**
  - `content/docs/guides/developers/cli/managing-courses.mdx` — CLI command documentation style

  **Test scenarios:**
  - Each command documented with flags and example output
  - Use case for each (when would you use compute-hash vs verify-hash)

  **Verification:**
  - All 4 commands documented with syntax, flags, and examples

### Phase 2: Update Existing Pages (5 files)

- [ ] **Unit 7: Update CLI transaction-signing page**

  **Goal:** Add `tx run`, `tx types`, `tx status`, `tx pending`, and exit codes

  **Requirements:** R4, R13

  **Dependencies:** None

  **Files:**
  - Modify: `content/docs/guides/developers/cli/transaction-signing.mdx`

  **Approach:**
  - Add `tx run` as the primary command (full 5-step pipeline) at the TOP, before the individual step commands. This is how most developers will interact with transactions.
  - Document all `tx run` flags: `--body`/`--body-file`, `--skey`, `--tx-type`, `--submit-url`, `--submit-header`, `--instance-id`, `--metadata`, `--no-wait`, `--timeout`
  - Add `tx types` (list valid tx types), `tx status <hash>`, `tx pending` commands
  - Add exit codes section at bottom: 0=success, 1=error, 2=not found, 3=auth required
  - Add `spec fetch` and `spec paths` commands briefly

  **Patterns to follow:**
  - Existing page structure — maintain the same heading hierarchy and code block style

  **Test scenarios:**
  - `tx run` is documented before individual step commands
  - Exit codes table is complete
  - All new commands have syntax examples

  **Verification:**
  - Page covers both `tx run` (convenience) and individual commands (debugging)
  - Exit codes documented for scripting use

- [ ] **Unit 8: Update error-handling page**

  **Goal:** Add five failure modes with recovery actions, commitment state expiry exceptions

  **Requirements:** R9, R10

  **Dependencies:** Unit 4 (references safe refetch concept)

  **Files:**
  - Modify: `content/docs/guides/developers/error-handling.mdx`

  **Approach:**
  - Add "Five Failure Modes" section with table: build error (4xx), sign error (local), submit rejection (Cardano), chain expiry (expired state), off-chain sync failure (failed state)
  - Each mode gets: what happened, how to detect, what to do
  - Critical distinction: `failed` with `confirmed_at` set = DON'T retry (chain tx succeeded, off-chain will auto-retry)
  - Add "Commitment State Expiry" section explaining that most states revert on TX expiry EXCEPT `PENDING_TX_COMMIT` and `PENDING_TX_LEAVE`
  - Link to new api-concepts page for "updated is the only safe refetch" context

  **Patterns to follow:**
  - Existing page structure — extend the tables and recovery patterns already there
  - Use `<Callout type="warn">` for the "don't retry failed state" warning

  **Test scenarios:**
  - All five failure modes documented with detection and recovery
  - Commitment expiry exceptions clearly explain the two non-reverting states
  - Developer can determine correct recovery action for any failure state

  **Verification:**
  - Five failure modes with distinct recovery actions
  - PENDING_TX_COMMIT and PENDING_TX_LEAVE exceptions explained

- [ ] **Unit 9: Update API integration page**

  **Goal:** Expand endpoint taxonomy to include billing, events, merged, token registry, verification

  **Requirements:** R14

  **Dependencies:** Units 1-5 (references new pages)

  **Files:**
  - Modify: `content/docs/guides/developers/api-integration.mdx`

  **Approach:**
  - Expand the endpoint category table to include: Billing (`/api/v2/billing/*`), Events (`/api/v2/events/*`), Users (`/api/v2/users/*`), Merged views (`/api/v2/course/user/*`, `/api/v2/project/user/*`), Verification (`/api/v2/verify/*`), Token registry (`/api/v2/token/*`)
  - Add Developer Auth to the categories (`/api/v2/auth/developer/*`)
  - Add API Key Management (`/api/v2/apikey/*`)
  - Link each category to the relevant new page
  - Update total endpoint count (~120+)

  **Patterns to follow:**
  - Existing table format on the page

  **Test scenarios:**
  - All endpoint categories represented
  - Links to new pages resolve

  **Verification:**
  - Endpoint taxonomy matches current gateway router

- [ ] **Unit 10: Update authentication page**

  **Goal:** Add three-credential model overview and link to new developer-accounts page

  **Requirements:** R15

  **Dependencies:** Unit 1 (references developer-accounts page)

  **Files:**
  - Modify: `content/docs/guides/developers/authentication.mdx`

  **Approach:**
  - Add an introductory section (before the wallet flow) with a table showing all three credential types: API Key, User JWT, Developer JWT — what each is, how to get it, when to use it
  - Brief note about Attestation JWT with link to developer-accounts page for details
  - Add link to new developer-accounts page for email/password flow
  - Keep the existing wallet auth content unchanged — it's correct and thorough

  **Patterns to follow:**
  - Existing page structure — add to the top, don't reorganize

  **Test scenarios:**
  - Three-credential table is the first reference section
  - Existing wallet flow content unchanged
  - Links to developer-accounts resolve

  **Verification:**
  - Developer can quickly see all three credential types and understand which they need

- [ ] **Unit 11: Update reference/environments page**

  **Goal:** Add dev environment URLs

  **Requirements:** R16

  **Dependencies:** None

  **Files:**
  - Modify: `content/docs/reference/environments.mdx`

  **Approach:**
  - Add dev environment row: `dev.api.andamio.io` / `dev.app.andamio.io`
  - Verify existing URLs are still accurate

  **Patterns to follow:**
  - Existing table format on the page

  **Test scenarios:**
  - All three environments listed: dev, preprod, production

  **Verification:**
  - Environment table has three rows

### Phase 3: Navigation & Cross-References

- [ ] **Unit 12: Update meta.json navigation and cross-references**

  **Goal:** Wire all new pages into sidebar navigation and update cross-references across existing pages

  **Requirements:** All

  **Dependencies:** Units 1-11

  **Files:**
  - Modify: `content/docs/guides/developers/meta.json`
  - Modify: `content/docs/guides/developers/cli/meta.json`
  - Modify: `content/docs/getting-started.mdx` (add link to developer-accounts for API key setup)
  - Modify: `content/docs/guides/developers/index.mdx` (add cards for new pages)

  **Approach:**
  - Developers meta.json final structure:
    ```
    index, first-app, api-quickstart,
    ---,
    api-integration, authentication, developer-accounts, api-keys,
    ---,
    api-concepts, transactions, error-handling, access-token-verification,
    --- Platform ---,
    billing,
    --- Tools ---,
    cli
    ```
  - CLI meta.json: add `hash-verification` after `transaction-signing`
  - Grep for "Next Steps" sections across modified pages and add cross-references to new pages where relevant
  - Update developers/index.mdx Cards to include new pages

  **Patterns to follow:**
  - Existing meta.json separator and ordering conventions
  - Existing Cards component usage in index pages

  **Test scenarios:**
  - All new pages appear in sidebar
  - No orphaned pages (every MDX has a meta.json entry)
  - `npm run build` succeeds

  **Verification:**
  - Full build passes
  - Sidebar navigation shows logical grouping
  - No broken internal links

## System-Wide Impact

- **Cross-references**: Getting-started page directs users to generate API keys — needs update to mention developer account registration as prerequisite
- **Glossary**: May need entries for "Developer JWT", "Attestation JWT", "source field" — check if glossary updates are warranted (deferred to implementation)
- **Guide pipeline**: The guide-tracker.json tracks guide status — new pages should be noted but this is a documentation-only change, not a pipeline-tracked guide
- **Live API docs**: These pages complement, not replace, the live Swagger at preprod.api.andamio.io — each page should link to Swagger for schema details

## Risks & Dependencies

- **API accuracy**: Billing tiers and pricing are from config.yaml — if pricing changes before merge, the docs page needs updating. Mitigate by using the exact values from the current config.
- **Getting-started flow**: The getting-started page may describe an outdated API key acquisition flow (app UI vs developer registration). Need to verify current flow during implementation.
- **Page count**: Adding 6 pages to the developer guides section. Risk of overwhelming sidebar — mitigated by using separators to group logically.

## Sources & References

- Audit conversation (this session) — cross-repo comparison of andamio-api, andamio-cli, andamio-dev against andamio-docs
- andamio-api CLAUDE.md and route files — endpoint inventory
- andamio-cli CLAUDE.md and command files — CLI command reference
- andamio-dev course modules M200, M300, M400 — onboarding pedagogy
- andamio-api `internal/config/config.yaml` — canonical tier/pricing configuration
- andamio-app-v2 `docs/solutions/architecture/stripe-redirect-billing-integration-pattern.md` — billing implementation details
- andamio-docs `docs/solutions/integration-issues/fumadocs-broken-directory-links.md` — Fumadocs navigation gotchas
