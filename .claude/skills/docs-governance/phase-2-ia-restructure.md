# Phase 2: IA Restructure (plan)

A confirm-first plan to make the [six roots](./SKILL.md#context-the-spine-the-rules-protect)
**structural**, so each product/zone owns a scoped sidebar, and to place tools per the
[governance rules](./SKILL.md). This is a one-time migration plan, not a durable rule; it lives
here because it is the first major application of the governance.

> **Status:** roadmap-aligned six-root spine signed off (orch Phase-2 IA session, 2026-06-29).
> Execution tracked in `andamio-docs` (`docs/plans/2026-06-29-001-feat-docs-phase2-six-root-ia-plan.md`).
> Phase 1 (front door + Issuer scaffold) shipped in PR #30.

## Goal

- Each product/zone is a real sidebar **root** that scopes the tree (when you're in Andamio API you
  see only API; in Apps & Tooling only Apps & Tooling).
- `/docs` is a neutral **front door**, no product preselected. (Per decision: API is *not* the default.)
- Tools and support repos are placed by the governance schema, not scattered.

## The roots (mirror the #28 Roadmap initiatives)

The docs roots use exactly the #28 Roadmap initiative names so the docs and roadmap stay legible
together:

```
/docs                          Front door (neutral — no product preselected)
├─ api/               (root)   Andamio API — developer product
├─ issuer/            (root)   Andamio Issuer — low-code product
├─ credential-badges/ (root)   Credential Badges — flagship (already top-level; keep)
├─ apps-tooling/      (root)   Apps & Tooling — Explore the App · Andamio Bot · CLI · App Template · SDK · Andamioscan
├─ developer-community/ (root) Developer Community — Pioneers · Repositories · community tools
└─ protocol/          (root)   Protocol — internals  ⚠️ contents NOT triaged here (see out of scope)
   cross-cutting (NOT a root): Glossary · Light Paper → front door / Reference zone
```

**Resolved placement decisions** (do not re-open):

- **Andamio Bot → Apps & Tooling** (it's one of the apps on the roadmap, not an "add to your server" tool).
- **Explore the App → Apps & Tooling** (folds in; *not* its own co-equal root).
- **Developer Community is its own root** (Pioneers + Repositories + community tools).
- **Glossary + Light Paper → cross-cutting Reference zone** on the front door, not roots. (Papers stay
  woven per the locked papers decision: the landing page is the artifact home; docs gets only woven content.)

## How scoping actually works (the mechanism, verified)

Verified against `fumadocs-ui` / `fumadocs-core` **15.4.1**:

- The sidebar tree is scoped **automatically** by Fumadocs' `TreeContext` (`contexts/tree.js`): it
  runs `searchPath(tree, pathname)` then `findLast(folder.root === true)` and renders only that
  folder's children. **A folder with `root: true` already gets a scoped subtree today** — `protocol/`
  does. The tree filtering is *not* the tabs' job.
- `RootToggle` and a tab's `urls` set only drive the **dropdown selector and active-highlight** —
  they do not filter the tree.
- The fix is therefore to switch `app/docs/layout.tsx` from a hand-written `sidebar.tabs` array to
  **`sidebar={{ tabs: true }}`** (auto-derive). `DocsLayout` calls `getSidebarTabs(tree)` internally,
  walking the tree for `root: true` folders and computing each tab's `urls` set. This makes the
  dropdown list all roots and highlight the active one robustly.

> Note: this corrects the earlier "manual tabs carry no `urls` set, so the tree isn't filtered"
> framing. The tree filtering was never the tabs' job — it comes from `TreeContext`. Don't hunt for
> a `urls`-based tree filter; it does not exist.

## Content moves (today → target root)

`(soft)` = reasonable call, revisit if it reads wrong in situ.

| Today | Target |
|---|---|
| `getting-started`, `guides/developers/*` (excl. `cli/`), `guides/developers/api-quickstart`, `reference/` | `api/` |
| `building-on-andamio` | `api/` — conceptual intro (soft) |
| `guides/courses`, `guides/projects`, `guides/contributors`, `demo` | `apps-tooling/` (Explore the App path) |
| `guides/developers/cli/`, `sdk/` | `apps-tooling/` (tools) |
| Andamioscan · App Template · Andamio Bot (pages where they exist) | `apps-tooling/` |
| `repositories`, `pioneers` | `developer-community/` |
| `issuer`, `credential-badges` | stay — add `root: true` |
| `protocol` | stay — already `root: true`, **contents untouched** |
| `light-paper`, `glossary` | stay top-level; surfaced in front-door Reference zone (no move) |

Tools placement (per [registry](./tool-registry.md)): CLI, App Template, SDK, Andamioscan, Andamio Bot
→ **Apps & Tooling**. Pioneers, Repositories → **Developer Community**. SDK stops being a top-level
section. The "External" link group is absorbed (canonical pages where they exist, zone index otherwise).

## Sequencing

- **2a: Mechanism spike (do first, small):** switch to auto-derived tabs and stand up a minimal `api/`
  root **alongside** the existing `protocol/` root; prove both scope and that `/docs` shows the neutral
  front door. De-risks everything below. **Hard gate — if it does not scope, stop and report.**
- **2b: Create the six roots + move content** with redirects (see below).
- **2c: Apply governance:** add per-product Tools groups + the Apps & Tooling / Developer Community
  zones; absorb External/SDK.
- **2d: Front door + polish:** finalize the neutral landing and the Reference zone (Glossary, Light Paper).

## Redirects (URL churn)

Moving content under roots changes many URLs. Every moved page needs a `permanent: true` redirect in
`next.config.mjs` — generate the full list from a pre/post route diff during 2b. Examples:

- `/docs/getting-started` → `/docs/api/getting-started`
- `/docs/guides/developers/*` → `/docs/api/guides/*`
- `/docs/sdk` → `/docs/apps-tooling/sdk`
- `/docs/guides/*` (platform) → `/docs/apps-tooling/*`
- `/docs/repositories` → `/docs/developer-community/repositories`
- `/docs/pioneers/*` → `/docs/developer-community/pioneers/*`

(The existing `/docs/repositories/*` redirects already in `next.config.mjs` now need to chain to the
new `developer-community/` location — reconcile, don't duplicate.)

## Risks & mitigations

- **External links / SEO** → permanent redirects for every moved URL; diff routes before/after.
- **Internal links** → grep-and-fix all in-repo links after moves; the build will not catch a stale
  `/docs/...` link (content-collections silently 404s).
- **Tooling that hardcodes paths** → `npm run docs-coverage` / `docs-drift` and the audit skills
  reference `content/docs/...` paths; update them. CLAUDE.md's Pioneers archival paths move too.
- **Search index** → rebuilds from content; verify search after the move.

## Out of scope (separate workstreams — do NOT do here)

- **Protocol deep triage** — the contents of `protocol/v2/*` (state-machine, transactions, validators,
  tokens) and the **Understand cluster** placement (`whats-new`, `cost-estimation`, `security-audit`).
  This restructure stands up the `protocol/` root but does **not** triage its contents.
  (`security-audit` / contract-verification is integrator-facing → likely also surfaces under API, but
  that's decided in the triage, not here.)
- **De-genericize the 45 token/validator stubs** — mostly under `protocol/v2/`, overlaps with the
  triage above.
