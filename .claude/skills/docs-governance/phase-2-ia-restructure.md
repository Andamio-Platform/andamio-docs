# Phase 2: IA Restructure (plan)

A confirm-first plan to make the [six roots](./SKILL.md#context-the-spine-the-rules-protect)
**structural**, so each product/zone is a collapsible section in one sidebar, and to place tools per the
[governance rules](./SKILL.md). This is a one-time migration plan, not a durable rule; it lives
here because it is the first major application of the governance.

> **Status:** roadmap-aligned six-root spine signed off (orch Phase-2 IA session, 2026-06-29).
> Execution tracked in `andamio-docs` (`docs/plans/2026-06-29-001-feat-docs-phase2-six-root-ia-plan.md`).
> Phase 1 (front door + Issuer scaffold) shipped in PR #30.

## Goal

- One **unified sidebar**: each namespace is a collapsible section, grouped under Products /
  Explore & build / Reference. No root-toggle dropdown — the section holding the current page
  auto-expands, the rest stay collapsed.
- `/docs` is a neutral **front door**, no product preselected.
- Tools and support repos are placed by the governance schema, not scattered.

## The namespaces (mirror the #28 Roadmap initiatives)

The docs sections use exactly the #28 Roadmap initiative names so the docs and roadmap stay legible
together. They are ordinary collapsible folders in one sidebar (not `root` folders), grouped:

```
/docs                            Front door (neutral — no product preselected)
─ Products
  ├─ api/                        Andamio API — developer product
  └─ issuer/                     Andamio Issuer — low-code product
─ Explore & build
  ├─ apps-tooling/               Apps & Tooling — Explore the App · Andamio Bot · CLI · App Template · SDK · Andamioscan
  ├─ credential-badges/          Credential Badges — flagship
  ├─ developer-community/        Developer Community — Pioneers · Repositories · community tools
  └─ protocol/                   Protocol — internals  ⚠️ contents NOT triaged here (see out of scope)
─ Reference
  ├─ glossary                    (cross-cutting page, not a section)
  └─ light-paper                 (cross-cutting page, not a section)
```

**Resolved placement decisions** (do not re-open):

- **Andamio Bot → Apps & Tooling** (it's one of the apps on the roadmap, not an "add to your server" tool).
- **Explore the App → Apps & Tooling** (folds in; *not* its own co-equal root).
- **Developer Community is its own root** (Pioneers + Repositories + community tools).
- **Glossary + Light Paper → cross-cutting Reference zone** on the front door, not roots. (Papers stay
  woven per the locked papers decision: the landing page is the artifact home; docs gets only woven content.)

## How the sidebar works (single tree, no toggle)

The namespaces are **ordinary folders** (no `root: true`) listed in the front-door
`content/docs/meta.json`. Fumadocs renders them as collapsible sections in one sidebar; the folder
containing the current page auto-expands, the rest stay collapsed. `app/docs/layout.tsx` uses the
default `DocsLayout` with no `sidebar.tabs` — so there is no root-toggle dropdown.

> **Mechanism note (why not the root toggle).** Fumadocs also supports a `root: true` model where each
> root folder gets its own *scoped* sidebar and you switch between them with a `RootToggle` dropdown
> (scoping comes from `TreeContext.findLast(folder.root)`; auto-derived tabs via `getSidebarTabs`).
> A spike proved that worked, but the dropdown-to-switch-namespace UX was rejected in favor of one
> unified, collapsible sidebar. Keep the namespaces as plain folders; do **not** add `root: true`
> back unless the navigation model is deliberately revisited.

## Content moves (today → target section)

`(soft)` = reasonable call, revisit if it reads wrong in situ.

| Today | Target |
|---|---|
| `getting-started`, `guides/developers/*` (excl. `cli/`), `guides/developers/api-quickstart`, `reference/` | `api/` |
| `building-on-andamio` | `api/` — conceptual intro (soft) |
| `guides/courses`, `guides/projects`, `guides/contributors`, `demo` | `apps-tooling/` (Explore the App path) |
| `guides/developers/cli/`, `sdk/` | `apps-tooling/` (tools) |
| Andamioscan · App Template · Andamio Bot (pages where they exist) | `apps-tooling/` |
| `repositories`, `pioneers` | `developer-community/` |
| `issuer`, `credential-badges` | stay — collapsible section |
| `protocol` | stay — collapsible section, **contents untouched** |
| `light-paper`, `glossary` | stay top-level; surfaced in front-door Reference zone (no move) |

Tools placement (per [registry](./tool-registry.md)): CLI, App Template, SDK, Andamioscan, Andamio Bot
→ **Apps & Tooling**. Pioneers, Repositories → **Developer Community**. SDK stops being a top-level
section. The "External" link group is absorbed (canonical pages where they exist, zone index otherwise).

## Sequencing (as shipped)

- **Mechanism spike:** stood up a `root: true` `api/` root beside `protocol/` and proved the scoped
  root-toggle worked. The dropdown-to-switch-namespace UX was then rejected (see the mechanism note
  above), so the roots were converted to plain collapsible folders in one sidebar.
- **Content moves:** the six namespaces created and content moved per the table, with a `permanent`
  redirect for every moved URL (see below).
- **Governance applied:** per-product Tools groups + the Apps & Tooling / Developer Community zones;
  External/SDK absorbed.
- **Front door:** neutral landing + the Reference zone (Glossary, Light Paper).

## Redirects (URL churn)

Moving content into the new sections changes many URLs. Every moved page needs a `permanent: true`
redirect in `next.config.mjs` — generate the full list from a pre/post route diff. Examples:

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
- **Tooling that hardcodes paths** → `docs-drift` and the audit skills reference `content/docs/...`
  paths; update them. CLAUDE.md's Pioneers archival paths move too. (`docs-coverage` was the other
  case here — it was never updated, broke against the retired transactions/validators MDX trees, and
  was removed in 2026-07.)
- **Search index** → rebuilds from content; verify search after the move.

## Out of scope (separate workstreams — do NOT do here)

- **Protocol deep triage** — the contents of `protocol/v2/*` (state-machine, transactions, validators,
  tokens) and the **Understand cluster** placement (`whats-new`, `cost-estimation`, `security-audit`).
  This restructure stands up the `protocol/` root but does **not** triage its contents.
  (`security-audit` / contract-verification is integrator-facing → likely also surfaces under API, but
  that's decided in the triage, not here.)
- **De-genericize the 45 token/validator stubs** — mostly under `protocol/v2/`, overlaps with the
  triage above.
