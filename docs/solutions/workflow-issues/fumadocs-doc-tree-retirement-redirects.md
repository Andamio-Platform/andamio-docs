---
title: Retiring a large docs tree in Fumadocs — redirects, slug collisions, and verification
date: 2026-06-29
category: workflow-issues
module: content/docs/protocol/v2, next.config.mjs
problem_type: workflow_issue
component: documentation
severity: high
applies_when:
  - "Deleting or replacing a large MDX tree in a Fumadocs + content-collections site"
  - "Adding permanent redirects for removed doc URLs in next.config.mjs"
  - "A new replacement page shares a URL slug with a tree being deleted"
tags: [fumadocs, content-collections, redirects, nextjs, doc-retirement, mdx, search]
related_components: [tooling]
---

# Retiring a large docs tree in Fumadocs — redirects, slug collisions, and verification

## Context

The protocol redesign (PR #45) retired four `protocol/v2/` trees (~88 pages: transactions, validators, tokens, state-machine) and replaced them with three new surfaces. Deleting a large tree in a Fumadocs + content-collections site has several silent failure modes the static build will not catch — `next build` succeeds even with broken internal links and mis-ordered redirects. This is the sequence and the gotchas that make it safe.

## Guidance

**Sequence the work so there's never a 404 window:**

1. **Build the new surfaces first, retire the old trees last.** Redirects need live destinations, and replacement pages must exist before the originals are deleted.
2. **Couple a deletion to its replacement when they share a slug.** A new `validators.mdx` and the old `validators/index.mdx` both compute the slug `protocol/v2/validators`. Because the docs collection glob is `**/*.mdx`, both ingest and one silently shadows the other. The old tree must be deleted **in the same change** that adds the replacement — not deferred to a later "retirement" step. Trees whose replacement lands at a *different* slug are safely deferrable.
3. **Redirect every removed URL in `next.config.mjs` `async redirects()`.** Order matters (Next matches array order): specific pages before broad `:path*`/`:path+` parents. Map specific old pages to their best new home (e.g. each retired transaction page → the stepper that now covers it); catch-all the rest.
4. **Repoint in-repo links, then verify at runtime.** `grep` the whole repo for links into the retired paths and repoint them — the build will *not* fail on stale internal links. Then run `next start` and `curl` to confirm redirects (status + `Location`) and that `/api/search` returns the new surfaces and not the retired stubs.

**Two redirect/Next gotchas:**

- **`:path+` vs `:path*` on a surviving bare path.** A wildcard whose bare path is a *surviving* page must use `:path+` (one-or-more segments), not `:path*` (zero-or-more). `/docs/x/validators/:path*` would also match the bare `/docs/x/validators` and shadow the new page; `:path+` only matches the deep tree. Verify the bare new page returns `200`, not `308`.
- **The static build hides broken links.** `next build` going green is *not* evidence that retirement is clean. Use the build's page-count delta as the dropped-page safety net, and verify links/redirects/search against a running server.

**Two content-collections / build gotchas hit during this work:**

- **Relative `./types` value-imports from a bundled data module can mis-resolve.** When an MDX page imports a data module and that module imports a sibling `./types`, the content-collections MDX bundler may resolve `./types` against the wrong base and collide with a repo-root `types/index.ts`. A *type-only* import is erased so it stays silent; switching it to a **value** import (e.g. to share a constant) suddenly fails with `No matching export ... for import "X"` pointing at the root `types/index.ts`. **Fix:** import shared *values* via the `@/` alias (`@/components/.../types`), not a relative path, from any file that gets bundled into MDX.
- **Never run two builds in one shell command.** `npm run build && npm run build` (or a foreground build while another runs) corrupts `.next` with `ENOENT`/`PageNotFoundError` that look like real failures. Single-build always; recover with `pkill -f next` + `rm -rf .next` + one clean build. (Also noted in the `fumadocs-full-width-page` auto-memory.)

## Why This Matters

Each of these fails *silently* or *misleadingly*: a slug collision renders the wrong page with no error; a `:path*` wildcard turns your brand-new page into a redirect; a green build masks dozens of broken links and an un-reindexed search; the `./types` collision only surfaces when you change an erased type import to a real value import. Catching them after deploy means 404s and shadowed pages in production. Catching them with a 5-minute `next start` + `curl` pass before the PR costs nothing.

## When to Apply

- Any bulk deletion, rename, or restructure of an MDX tree in Fumadocs + content-collections.
- Whenever a replacement page could share a slug with content being removed.
- Whenever you add `redirects()` entries whose wildcard could overlap a surviving page.

## Examples

Runtime verification (the gate the static build can't provide):

```bash
# redirects: retired URL must 308 to the right home; new bare page must stay 200
npx next start -p 3100 &
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" localhost:3100/docs/protocol/v2/transactions/course/student/assignment/commit
# -> 308 .../sequences/course-learn-earn
curl -s -o /dev/null -w "%{http_code}\n" localhost:3100/docs/protocol/v2/validators   # -> 200, NOT 308
# search re-indexed: new surfaces present, retired stubs gone
curl -s "localhost:3100/api/search?query=transaction+sequence"
```

Redirect wildcard that protects a surviving page:

```js
// deep tree only — bare /validators is the NEW page, must not be shadowed
{ source: '/docs/protocol/v2/validators/:path+', destination: '/docs/protocol/v2/validators', permanent: true },
// (no bare-path redirect for validators)
```

Confirm content-collections actually ingested a new/edited page (frontmatter can be silently dropped):

```bash
grep "'protocol/v2/validators'" .content-collections/generated/allDocs.js   # exactly one entry, the new page
```

## Related

- [Source-backed documentation with a prebuild drift guard](../design-patterns/source-backed-docs-with-drift-guard.md) — Surface 2 of the same redesign.
- `docs/solutions/integration-issues/fumadocs-broken-directory-links.md` — directory URLs need an `index.mdx`; build page-count as the dropped-page safety net.
- `docs/solutions/integration-issues/nextjs-fumadocs-pdf-static-asset-serving.md` — the "adding a doc section" checklist (frontmatter → meta.json → grep cross-refs → verify in dev).
