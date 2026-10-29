---
name: docs-governance
description: Decide how to document complementary tools and support repos (CLI, SDK, templates, bots, dev/agent repos) so they drive adoption and contributions without competing with the products. Use when adding or reviewing docs for anything that is not itself a sold product, or when deciding where a tool belongs in the IA.
---

# Docs Governance

The durable rules for how the Andamio docs site is shaped. This skill starts with one
governed decision, **how to position complementary tools and support repos**, and will
grow over time as we codify more IA and content rules. Treat it as living: when a rule
proves wrong or incomplete, change it here and note why.

## When to use

- Adding docs for a tool, library, template, bot, or support repo that is **not** a product we sell.
- Deciding where something belongs in the sidebar / IA.
- Reviewing a PR that introduces or moves tool-related pages or links.
- Onboarding a new complementary tool into the ecosystem.

If you're documenting one of the **products** themselves (Andamio Issuer, Andamio API), the
**Apps & Tooling** or **Developer Community** zones, or the **Protocol** reference, this skill
governs only the *tool* pages that hang off them, not the product content itself.

## Context: the structure the rules protect

The docs sidebar has **three roots**. Each is a Fumadocs `root: true` folder with its own scoped
sidebar, and readers switch between them with the stock root switcher at the top of the sidebar.

1. **Andamio Issuer** (`content/docs/issuer/`): the product for organizations that issue
   credentials from programs they already run (sales-led, enterprise key). A buyer needs a
   developer to integrate it.
2. **Andamio API** (`content/docs/(developer)/`): the developer product (self-serve, developer
   key). It holds `api/`, the **Apps & Tooling** zone (Explore the App, Andamio Bot, CLI, App
   Template, Andamioscan, agent tooling) and the developer-facing **Credential Badges** pages.
3. **Protocol** (`content/docs/(protocol)/`): on-chain internals, contract verification and the
   security audit.

Shared pages sit outside every root and are reachable from all of them through persistent sidebar
links: `/docs` (a neutral front door, no product preselected), the Glossary, and **Developer
Community** (Pioneers, Repositories, community tools).

Two rules keep this structure intact. Never put an `index.mdx` directly in a group folder such as
`(developer)/` or `(protocol)/`: group folders are dropped from URLs, so that page would serve `/docs`
and shadow the home page. And list every root folder in `content/docs/meta.json`: an unlisted root
silently disappears from the sidebar. `npm run docs-orphans` fails on both.

Two **products** anchor the structure (Issuer, API). They are bought by different customers with
different keys, and a key for one gets a 403 on the other, so each product's reader should see only
that product's pages. Apps & Tooling, Credential Badges, Developer Community and Protocol are
supporting zones. Everything in this skill exists to keep that structure legible.

*Rationale (2026-10, andamio-docs#112):* replaces the June 2026 single unified sidebar with six
sections. The six sections were namespaces of one product. Issuer and API are now separate
products, and mixing them sent Issuer readers to API instructions that do not apply.

## The principle

> **Products and product-zones are the spine; tools are accessories that hang off a product or a zone.**

No single **tool** becomes a top-level peer to the products. A tool hangs off the product it
serves (in that product's Tools group) or, when it is itself one of the apps, lives inside the
**Apps & Tooling** zone — the Andamio Bot is an app there, not a sold-product peer. If a reader
cannot tell at a glance what they **buy or build on** versus what merely **helps**, the docs have
failed.

## The gate: the two-line test

Before any tool gets space in the docs, answer both. If you can't answer #1, it does not go in
product docs: at most it gets a line in the Developer Community index.

1. **Which product or zone does this make easier?** (Issuer · API · Apps & Tooling · Credential Badges · Developer Community · Protocol · cross-cutting)
2. **What single action do we want the reader to take?** (Install · Use · Point your agent at it · Clone/fork · Add/try · Contribute)

## Two reader intents, two confusions to prevent

Every tool page serves up to two outcomes and should carry **both CTAs** when both apply:

- **Adopt** (reduces friction → drives sales): "Use this to ship faster on [product]."
- **Build / contribute** (drives contributions): "Source here, contribute here."

Design against the two failure modes:

- **Product confusion**: a tool reads like something you buy.
  *Fix:* visual + structural separation, and the tool's first line names the product it serves.
- **Sprawl confusion**: the same tool described in five places, drifting.
  *Fix:* **one canonical page per tool**; every other mention is a contextual inline link to it.

## The classification schema

Fill these in for every tool. The living answers live in [`tool-registry.md`](./tool-registry.md).

| Field | Options |
|---|---|
| **Serves** | Issuer · API · Apps & Tooling · Credential Badges · Developer Community · Protocol · cross-cutting |
| **Type** | Accelerator (libs/templates) · Workflow tool (CLI) · Agent enablement · Integration/bot · Source repo |
| **Audience** | Buyer-adopter · Builder · Contributor · End-user |
| **Primary action** | Install · Use · Point your agent at it · Clone/fork · Add/try · Contribute |
| **Canonical home** | exactly one page |
| **Contextual surfaces** | the product guides where it's mentioned at the moment of need |
| **Status** | Official-stable · Official-preview · Community |
| **Outcome** | Adoption (sales) · Contribution · Retention |
| **Owner** | who keeps the page current |

## Placement rules (derived from Serves + Type)

- **Serves one product** → canonical page lives **inside that product's section**, in a small
  **Tools** group at the bottom of that product's sidebar. Surface it contextually in the guides
  where it's needed.
- **Is one of the apps, or cross-cutting developer tooling** (Bot, CLI, App Template, Andamioscan) →
  canonical page in the **Apps & Tooling** zone inside the Andamio API root, linked from the pages
  it touches. Do not link Issuer pages into it: Issuer readers do not use developer tooling.
- **Community-facing or a raw repo with no narrative** → the **Developer Community** zone (Pioneers,
  Repositories index). Never let bare GitHub/SDK links compete with product nav in the main sidebar.
- A tool may be **mentioned** anywhere it helps, but **documented** in exactly one place.
- Tools never appear as a sidebar root or a top-level section; they hang off a product or zone.

## Labeling conventions (prevent product/tool confusion)

- Products carry no "tool" marker; they are the implicit spine.
- Every tool page opens with a consistent header line: the tool name, a **Tool** tag, and its
  **status** (`Official · Stable`, `Official · Preview`, or `Community`).
- First sentence always states the served product: *"Use [tool] to [do X] with [product]."*
- Status words are honest and load-bearing: do not label a community or experimental tool "Official · Stable."

## The reusable tool-page template

Every tool page uses the same shape so they read as a class, not as ad-hoc pages:

```mdx
---
title: <Tool name>
description: Use <tool> to <do X> with <product>.
---

> **<Tool name>** · Tool · <Official · Stable | Official · Preview | Community>

One line: what it is and which product/job it serves.

## When to reach for it
<the situations where this is the right tool>

## Start
<the single primary action: install / point your agent / clone / add>

## Source & contribute
<repo link + contributing pointer, when applicable>

## Where it fits
<one line tying it back to the product flow, with a link>
```

## How this maps to the IA

- Each product root can hold a small **Tools** group with only the tools that serve it.
- The **Apps & Tooling** zone (inside the Andamio API root) holds the apps and cross-cutting developer
  tooling; the shared **Developer Community** section holds the repositories index and community tools.
- External links that belong to one product sit at the bottom of that root (the Issuer API reference
  in Andamio Issuer, the API reference in Andamio API). Site-wide links (Andamio App, andamio.io,
  GitHub) are icon links in the sidebar footer, set in `app/docs/layout.tsx`.
- See [`phase-2-ia-restructure.md`](./phase-2-ia-restructure.md) for the history of the structure.

## Refining this skill

This is a starting point, expected to evolve. When you change a rule:

1. Edit the rule here and add a one-line rationale.
2. Re-check [`tool-registry.md`](./tool-registry.md) for entries the change affects.
3. If the change alters structure, reflect it in [`phase-2-ia-restructure.md`](./phase-2-ia-restructure.md).
