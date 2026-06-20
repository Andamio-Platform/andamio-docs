# Phase 2: IA Restructure (plan)

A confirm-first plan to make the [four jobs](./SKILL.md#context-the-spine-the-rules-protect)
**structural**, so each product owns a scoped sidebar, and to place tools per the
[governance rules](./SKILL.md). This is a one-time migration plan, not a durable rule; it lives
here because it is the first major application of the governance.

> **Status:** proposed, not started. Do not execute without sign-off. Phase 1 (front door +
> Issuer scaffold) shipped in PR #30.

## Goal

- Each product is a real sidebar **root** that scopes the tree (when you're in Andamio API you see
  only API; in Issuer only Issuer).
- `/docs` is a neutral **front door**, no product preselected. (Per decision: API is *not* the default.)
- Tools and support repos are placed by the governance schema, not scattered.

## Why this is needed (the root-toggle finding)

From PR #30: the manual `sidebar.tabs` array in `app/docs/layout.tsx` only swaps the dropdown
**label**; it does not filter the sidebar tree, because manual tab options carry no `urls` set and
`RootToggle` is just a selector. The **Protocol** tab has this same limitation today. Real scoping
requires:

1. Each product is a folder with `root: true` in its `meta.json` (so it appears in the page tree as a root).
2. Tabs are **auto-derived** (`getSidebarTabs` walks the tree for `root` folders and computes each
   tab's `urls` set), instead of a hand-written array.
3. The layout renders the active root's subtree.

## Target structure

```
/docs                         Front door (no product preselected)
├─ api/         (root)        Andamio API: developer product
│   ├─ quickstart, guides (auth, transactions, sponsorship, billing, …), reference/environments
│   ├─ building-on-andamio    (the developer/protocol paper, conceptual intro)
│   └─ Tools/                 CLI · Build with your agent (andamio-dev) · App Template · SDK
├─ issuer/      (root)        Andamio Issuer: low-code product   (exists)
│   ├─ overview, how-it-works, quickstart, integrate
│   └─ Tools/                 (issuer-specific accelerators, as they appear)
├─ app/         (root)        Explore the App: end-user path
│   └─ roles, take a course, earn credentials, …   (today's guides/)
├─ protocol/    (root)        Protocol: advanced reference   (exists)
└─ ecosystem/   (root)        Ecosystem: Andamioscan · Repositories · Pioneers · community/cross-cutting tools
```

## Content moves (today → target)

| Today | Target |
|---|---|
| `getting-started`, `guides/developers/*`, `sdk`, `guides/developers/api-quickstart`, `reference/environments` | `api/` |
| `building-on-andamio` | `api/` (conceptual intro) |
| `guides/` (roles, courses, projects, contributors) | `app/` |
| `demo` | `app/` |
| `repositories`, `pioneers`, Andamioscan | `ecosystem/` |
| `light-paper`, `glossary` | **open decision** (front door / Ecosystem / top-level) |
| `protocol/v2/whats-new`, `cost-estimation`, `security-audit` | API or Protocol (**open decision**) |
| `reference` (page) | fold into `api/` reference or Ecosystem |

Tools placement (per [registry](./tool-registry.md)): CLI, andamio-dev, App Template, SDK →
**API → Tools**. Andamioscan, Repositories → **Ecosystem**. SDK stops being a top-level section.
The "External" link group is absorbed (canonical pages where they exist, Ecosystem index otherwise).

## Sequencing

- **2a: Mechanism spike (do first, small):** convert one product (e.g. create `api/` root or use the
  existing `issuer/` + `protocol/`) and prove the auto-derived toggle actually scopes the sidebar, and
  that landing on `/docs` shows the front door with no product preselected. De-risks everything below.
- **2b: Create product roots + move content** with redirects (see below).
- **2c: Apply governance:** add per-product Tools groups + the Ecosystem zone; absorb External/SDK.
- **2d: Front door + polish:** finalize the neutral landing and the open decisions.

## Redirects (URL churn)

Moving content under product roots changes many URLs. Every moved page needs a `permanent: true`
redirect in `next.config.mjs`. High-traffic / linked ones to cover first:

- `/docs/getting-started` → `/docs/api/getting-started`
- `/docs/guides/developers/*` → `/docs/api/guides/*`
- `/docs/guides/developers/api-quickstart` → `/docs/api/quickstart`
- `/docs/sdk` → `/docs/api/tools/sdk`
- `/docs/guides/*` (platform) → `/docs/app/*`
- `/docs/repositories` → `/docs/ecosystem/repositories`
- `/docs/reference/environments` → `/docs/api/reference/environments`

(Generate the full list from a pre/post route diff during 2b.)

## Risks & mitigations

- **External links / SEO** → permanent redirects for every moved URL; diff routes before/after.
- **Internal links** → grep-and-fix all in-repo links after moves; the build will not catch a stale
  `/docs/...` link (content-collections silently 404s).
- **Tooling that hardcodes paths** → `npm run docs-coverage` / `docs-drift` and the audit skills
  reference `content/docs/...` paths; update them.
- **Search index** → rebuilds from content; verify search after the move.

## Open decisions (need James)

1. **Default landing**: confirmed neutral front door (no product preselected). ✅ (already decided)
2. **Explore the App**: full product root, or a lighter section under the front door? (Job 4 is "less important but present.")
3. **Andamio Bot**: which job does it serve? Blocks its placement (see [registry](./tool-registry.md)).
4. **The papers & glossary**: where do `light-paper`, `building-on-andamio`, and `glossary` live? (Light Paper reads like front-door/about; Building on Andamio is the API conceptual intro; Glossary is cross-cutting.)
5. **Understand cluster**: `whats-new`, `cost-estimation`, `security-audit` → API, Protocol, or split?
