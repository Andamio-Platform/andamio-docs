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

If you're documenting one of the **products** themselves (Andamio API, Andamio Issuer, Credential
Badges), the **Apps & Tooling** or **Developer Community** zones, or the **Protocol** reference,
this skill governs only the *tool* pages that hang off them, not the product content itself.

## Context: the spine the rules protect

The docs sidebar sections mirror the [#28 Roadmap initiatives](./phase-2-ia-restructure.md), so the
docs and the roadmap stay legible together. **Six sections:**

1. **Andamio API**: the developer product (self-serve).
2. **Andamio Issuer**: the low-code, API-based product (sales-led).
3. **Credential Badges**: the flagship credential product.
4. **Apps & Tooling**: the category zone — Explore the App, Andamio Bot, CLI, App Template, SDK, Andamioscan.
5. **Developer Community**: Pioneers, Repositories, and community tools.
6. **Protocol**: on-chain internals (advanced reference).

`/docs` is a neutral **front door** (no product preselected). Glossary and Light Paper are
cross-cutting references on the front door, **not** roots.

Three **products** anchor the spine (API, Issuer, Credential Badges). Apps & Tooling, Developer
Community, and Protocol are supporting zones. Everything in this skill exists to keep that spine
legible.

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

1. **Which product or zone does this make easier?** (API · Issuer · Credential Badges · Apps & Tooling · Developer Community · Protocol · cross-cutting)
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
| **Serves** | API · Issuer · Credential Badges · Apps & Tooling · Developer Community · Protocol · cross-cutting |
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
- **Is one of the apps, or cross-cutting tooling** (Bot, CLI, App Template, SDK, Andamioscan) →
  canonical page in the **Apps & Tooling** zone, linked from the products it touches.
- **Community-facing or a raw repo with no narrative** → the **Developer Community** zone (Pioneers,
  Repositories index). Never let bare GitHub/SDK links compete with product nav in the main sidebar.
- A tool may be **mentioned** anywhere it helps, but **documented** in exactly one place.
- Tools never appear as a top-level namespace section; they hang off a product or zone.

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

This schema folds into the [Phase 2 restructure](./phase-2-ia-restructure.md):

- Each product section gets a small **Tools** group holding only the tools that serve it.
- The **Apps & Tooling** root holds the apps and cross-cutting tooling (Bot, CLI, App Template, SDK,
  Andamioscan); the **Developer Community** root holds the repositories index and community tools.
- The current "External" link dump and the standalone top-level "SDK" section are absorbed into
  this (SDK now lives under Apps & Tooling), so tools stop visually competing with products.

## Refining this skill

This is a starting point, expected to evolve. When you change a rule:

1. Edit the rule here and add a one-line rationale.
2. Re-check [`tool-registry.md`](./tool-registry.md) for entries the change affects.
3. If the change alters structure, reflect it in [`phase-2-ia-restructure.md`](./phase-2-ia-restructure.md).
