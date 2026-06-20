# Tool Registry

The living classification of every complementary tool and support repo, scored against the
[classification schema](./SKILL.md#the-classification-schema). Add a row when a new tool appears;
update a row when a tool's served product, status, or canonical home changes.

Status legend: **Official · Stable** · **Official · Preview** · **Community** · **TBD** (needs a decision).

## Placed tools

| Tool | Serves | Type | Audience | Primary action | Canonical home | Surfaced in | Status |
|---|---|---|---|---|---|---|---|
| **Andamio CLI** (`andamio-cli`) | API / Protocol | Workflow tool | Builder | Install & use | API → Tools → CLI | API transactions guide, Protocol | Official · Stable |
| **andamio-dev** | API | Agent enablement | Builder (via agent) | Point your agent at it | API → Tools → Build with your agent | API quickstart, CLI page | Official · Stable |
| **App Template** (`andamio-app-template`) | API | Accelerator / example | Builder | Clone & deploy | API → Tools → Templates | "Create your own app" | Official · Stable |
| **SDK** (`sdk.andamio.io`) | API | Accelerator (libs) | Builder | Install | API → Tools → SDK | API guides | Official · Stable |
| **Andamioscan** | cross-cutting | Integration / explorer | Builder · End-user | Open / use | Ecosystem → Andamioscan | Protocol, App | Official · Stable |

## Unplaced: needs a decision

| Tool | Blocking question | Notes |
|---|---|---|
| **Andamio Bot** | **Which product or job does it serve?** | Until the served job is decided (test #1), it cannot be placed. If it serves a single product → that product's Tools group. If it's community/cross-cutting → Ecosystem. Confirm type (integration/bot) and status (Official vs Community). |

## Notes per tool

### Andamio CLI
Wraps the full transaction lifecycle (build, sign, submit, register, confirm) and is the source of
truth for what an Andamio transaction looks like. Calls the API (`preprod` / `mainnet`). Often driven
by an agent via `andamio-dev`. Document the *use*; defer the canonical command reference to the repo.

### andamio-dev
The knowledge layer that teaches an agent the protocol, estimates costs, and drives the CLI. Its docs
page is "Build with your agent" inside the API section: what it is, point your agent at it, what it
unlocks. Not a product; an adoption accelerator.

### App Template
The fastest way to stand up an app on the API, using the same UX as `app.andamio.io` pointed at your
own courses/projects. Document as the recommended starting point in "Create your own credentialing app."

### SDK
Currently a top-level sidebar section. Per the placement rules it should move under **API → Tools** so
it stops reading as a peer to the products. Tracked in the Phase 2 plan.

### Andamioscan
On-chain explorer for Andamio state. Cross-cutting (useful from both Protocol and App contexts), so it
lives in the shared Ecosystem zone.

## Maintenance

- Reviewed alongside any PR that adds or moves tool docs.
- When a tool changes status (e.g., Preview → Stable, Community → Official), update the row and the
  tool page's header line together.
