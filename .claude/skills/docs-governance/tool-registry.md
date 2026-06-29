# Tool Registry

The living classification of every complementary tool and support repo, scored against the
[classification schema](./SKILL.md#the-classification-schema). Add a row when a new tool appears;
update a row when a tool's served product, status, or canonical home changes.

Status legend: **Official · Stable** · **Official · Preview** · **Community** · **TBD** (needs a decision).

## Placed tools

| Tool | Serves | Type | Audience | Primary action | Canonical home | Surfaced in | Status |
|---|---|---|---|---|---|---|---|
| **Andamio CLI** (`andamio-cli`) | Apps & Tooling | Workflow tool | Builder | Install & use | Apps & Tooling → CLI | API transactions guide, Protocol | Official · Stable |
| **andamio-dev** | API | Agent enablement | Builder (via agent) | Point your agent at it | API → Tools → Build with your agent | API quickstart, CLI page | Official · Stable |
| **App Template** (`andamio-app-template`) | Apps & Tooling | Accelerator / example | Builder | Clone & deploy | Apps & Tooling → Templates | "Create your own app" | Official · Stable |
| **SDK** (`sdk.andamio.io`) | Apps & Tooling | Accelerator (libs) | Builder | Install | Apps & Tooling → SDK | API guides | Official · Stable |
| **Andamioscan** | Apps & Tooling | Integration / explorer | Builder · End-user | Open / use | Apps & Tooling → Andamioscan | Protocol, Apps & Tooling | Official · Stable |
| **Andamio Bot** | Apps & Tooling | Integration / bot | Builder · End-user | Add / try | Apps & Tooling → Bot | Apps & Tooling | TBD (confirm Official vs Community) |
| **Repositories index** | Developer Community | Source repo | Builder · Contributor | Clone / contribute | Developer Community → Repositories | Protocol, Apps & Tooling | Official · Stable |

Andamio Bot is one of the **apps** on the #28 Roadmap, so it lives inside the Apps & Tooling zone —
not a sold-product peer (see [SKILL.md principle](./SKILL.md#the-principle)). Confirm its status
(Official vs Community) before publishing its page.

**Developer Community zone** also holds **Pioneers** (the cohort program) alongside the Repositories
index. Pioneers is a program, not a tool, so it has no registry row — but its docs live under the
`developer-community/` root.

## Notes per tool

### Andamio CLI
Wraps the full transaction lifecycle (build, sign, submit, register, confirm) and is the source of
truth for what an Andamio transaction looks like. Calls the API (`preprod` / `mainnet`). Often driven
by an agent via `andamio-dev`. Lives in the Apps & Tooling zone; surfaced contextually in the API
transactions guide and Protocol. Document the *use*; defer the canonical command reference to the repo.

### andamio-dev
The knowledge layer that teaches an agent the protocol, estimates costs, and drives the CLI. Its docs
page is "Build with your agent" inside the API section: what it is, point your agent at it, what it
unlocks. Not a product; an adoption accelerator.

### App Template
The fastest way to stand up an app on the API, using the same UX as `app.andamio.io` pointed at your
own courses/projects. Document as the recommended starting point in "Create your own credentialing app."

### SDK
Currently a top-level sidebar section. Per the placement rules it moves under **Apps & Tooling → SDK**
so it stops reading as a peer to the products. Tracked in the Phase 2 plan.

### Andamioscan
On-chain explorer for Andamio state. Useful from both Protocol and app contexts; lives in the
**Apps & Tooling** zone, surfaced contextually where it helps.

### Andamio Bot
An app on the #28 Roadmap (App v2.5.0 · Bot v1.0). Lives inside the **Apps & Tooling** zone as one of
the apps, not a sold-product peer. Confirm its status (Official vs Community) and primary action before
publishing the page.

## Maintenance

- Reviewed alongside any PR that adds or moves tool docs.
- When a tool changes status (e.g., Preview → Stable, Community → Official), update the row and the
  tool page's header line together.
