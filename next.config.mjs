import { withContentCollections } from '@content-collections/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'colony-recorder.s3.amazonaws.com',
      },
    ],
  },
  // Phase 2 six-root IA restructure — every moved URL gets a permanent
  // redirect. Order matters: Next matches in array order, so more specific
  // sources (e.g. guides/developers/cli) must precede their broader parents
  // (guides/developers). Generated from a pre/post route diff of the move.
  async redirects() {
    return [
      // Andamio Issuer is now its own product section; the old single page moved.
      { source: '/docs/andamio-issuer', destination: '/docs/issuer', permanent: true },

      // Papers live on the landing (www.andamio.io/whitepaper), not in docs. The
      // old docs "Coming soon" stubs were removed; redirect their URLs to the
      // canonical whitepaper pages. Destinations are absolute (cross-domain:
      // docs.andamio.io -> andamio.io), which Next.js supports directly.
      { source: '/docs/light-paper', destination: 'https://www.andamio.io/whitepaper', permanent: true },
      { source: '/docs/api/building-on-andamio', destination: 'https://www.andamio.io/whitepaper/building-on-andamio', permanent: true },

      // guides/ dismantled across api/ and apps-tooling/ — CLI first (it lived
      // under developers/ but belongs to Apps & Tooling), then the rest.
      { source: '/docs/guides/developers/cli/:path*', destination: '/docs/apps-tooling/cli/:path*', permanent: true },
      { source: '/docs/guides/developers/:path*', destination: '/docs/api/guides/:path*', permanent: true },
      // The operational guides (courses/projects/contributors) moved into the app
      // itself (in-app teaching); legacy guide URLs land on the Andamio App entry.
      { source: '/docs/guides/courses/:path*', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/guides/projects/:path*', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/guides/contributors/:path*', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/guides/getting-started', destination: '/docs/apps-tooling/andamio-app/explore-getting-started', permanent: true },
      { source: '/docs/guides/roles', destination: '/docs/apps-tooling/andamio-app/roles', permanent: true },
      { source: '/docs/guides/preprod-wallet-setup', destination: '/docs/apps-tooling/andamio-app/preprod-wallet-setup', permanent: true },
      { source: '/docs/guides', destination: '/docs/apps-tooling', permanent: true },

      // Apps & Tooling flattened to a catalog (2026-07-01). The Andamio app's
      // orientation pages moved under /andamio-app/, and the operational guides
      // (courses/projects/contributors) moved into the app as in-app teaching —
      // their old URLs land on the Andamio App entry.
      { source: '/docs/apps-tooling/explore-getting-started', destination: '/docs/apps-tooling/andamio-app/explore-getting-started', permanent: true },
      { source: '/docs/apps-tooling/roles', destination: '/docs/apps-tooling/andamio-app/roles', permanent: true },
      { source: '/docs/apps-tooling/demo', destination: '/docs/apps-tooling/andamio-app/demo', permanent: true },
      { source: '/docs/apps-tooling/preprod-wallet-setup', destination: '/docs/apps-tooling/andamio-app/preprod-wallet-setup', permanent: true },
      { source: '/docs/apps-tooling/courses/:path*', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/apps-tooling/courses', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/apps-tooling/projects/:path*', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/apps-tooling/projects', destination: '/docs/apps-tooling/andamio-app', permanent: true },
      { source: '/docs/apps-tooling/contributors', destination: '/docs/apps-tooling/andamio-app', permanent: true },

      // Top-level pages moved under api/.
      { source: '/docs/getting-started', destination: '/docs/api/getting-started', permanent: true },
      // building-on-andamio is now a landing paper, not a docs page — point the
      // legacy top-level path straight at the landing (avoids a 2-hop chain
      // through the removed /docs/api/building-on-andamio stub).
      { source: '/docs/building-on-andamio', destination: 'https://www.andamio.io/whitepaper/building-on-andamio', permanent: true },
      { source: '/docs/reference/:path*', destination: '/docs/api/reference/:path*', permanent: true },

      // API section IA: the "Developer Guides" wrapper folder was dissolved.
      // Intro pages moved loose under /api/; the two heavy clusters became
      // nested folders (accounts/, core/). Specific exact matches first, then
      // the bare index, then a catch-all for anything unmapped.
      // API Quickstart merged into the Quickstart (getting-started) page.
      { source: '/docs/api/api-quickstart', destination: '/docs/api/getting-started', permanent: true },
      // Access Token Verification pulled from public docs (endpoints filtered
      // out of the public OpenAPI reference).
      { source: '/docs/api/core/access-token-verification', destination: '/docs/api', permanent: true },
      { source: '/docs/api/guides/api-quickstart', destination: '/docs/api/getting-started', permanent: true },
      { source: '/docs/api/guides/first-app', destination: '/docs/api/first-app', permanent: true },
      { source: '/docs/api/guides/billing', destination: '/docs/api/billing', permanent: true },
      { source: '/docs/api/guides/api-integration', destination: '/docs/api/accounts/api-integration', permanent: true },
      { source: '/docs/api/guides/authentication', destination: '/docs/api/accounts/authentication', permanent: true },
      { source: '/docs/api/guides/developer-accounts', destination: '/docs/api/accounts/developer-accounts', permanent: true },
      { source: '/docs/api/guides/api-keys', destination: '/docs/api/accounts/api-keys', permanent: true },
      { source: '/docs/api/guides/api-concepts', destination: '/docs/api/core/api-concepts', permanent: true },
      { source: '/docs/api/guides/transactions', destination: '/docs/api/core/transactions', permanent: true },
      { source: '/docs/api/guides/sponsored-transactions', destination: '/docs/api/core/sponsored-transactions', permanent: true },
      { source: '/docs/api/guides/error-handling', destination: '/docs/api/core/error-handling', permanent: true },
      { source: '/docs/api/guides/access-token-verification', destination: '/docs/api/core/access-token-verification', permanent: true },
      { source: '/docs/api/guides', destination: '/docs/api', permanent: true },
      { source: '/docs/api/guides/:path*', destination: '/docs/api', permanent: true },

      // Apps & Tooling.
      { source: '/docs/demo', destination: '/docs/apps-tooling/andamio-app/demo', permanent: true },
      // The old SDK section (phantom @andamio/transactions) was removed; the real
      // open package is @andamio/core, now the "Core" entry.
      { source: '/docs/sdk/:path*', destination: '/docs/apps-tooling/core', permanent: true },
      { source: '/docs/apps-tooling/sdk/:path*', destination: '/docs/apps-tooling/core', permanent: true },
      { source: '/docs/apps-tooling/sdk', destination: '/docs/apps-tooling/core', permanent: true },

      // CLI docs thinned to canonical-in-repo: the andamio-cli GitHub repo is the
      // source of truth (README + lifecycle docs). The section now carries only the
      // landing (About + command tables + Quick Start + canonical callout) and the
      // Import Format reference. The eight guide-mirroring sub-pages were removed;
      // their URLs 301 to the CLI landing, which routes readers out to the repo.
      { source: '/docs/apps-tooling/cli/installation', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/authentication', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/managing-courses', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/import-export', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/managing-tasks', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/task-import-export', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/transaction-signing', destination: '/docs/apps-tooling/cli', permanent: true },
      { source: '/docs/apps-tooling/cli/hash-verification', destination: '/docs/apps-tooling/cli', permanent: true },

      // Developer Community. The repositories wildcard also absorbs the old
      // flattened per-repo subpages (on-chain/apis/templates/docs), so those
      // legacy redirects collapse into this one rule pointing at the new home.
      { source: '/docs/pioneers/:path*', destination: '/docs/developer-community/pioneers/:path*', permanent: true },
      { source: '/docs/repositories/:path*', destination: '/docs/developer-community/repositories', permanent: true },

      // Protocol V1 retired. The V1 MDX tree was removed some time ago, but no
      // redirect ever replaced it, so every /docs/protocol/v1/** URL 404'd —
      // including the "Tx Documentation" link the v1 dashboard still serves
      // (issue #14). V1 has no per-page equivalent in V2, so the whole tree
      // collapses onto the protocol intro rather than guessing at mappings.
      // Deep paths first, then the bare path.
      { source: '/docs/protocol/v1/:path*', destination: '/docs/protocol/v2', permanent: true },
      { source: '/docs/protocol/v1', destination: '/docs/protocol/v2', permanent: true },

      // Protocol docs redesign — the transactions/, validators/(deep), tokens/,
      // and state-machine/ trees were retired in favour of three surfaces:
      // the intro (/docs/protocol/v2), the single Validators page, and the
      // transaction-sequence steppers. Specific transaction pages point at the
      // sequence stepper that now covers their workflow; the rest fall through
      // to broader rules. Order matters (specific before the :path+ catch-alls).
      //
      // NOTE: /docs/protocol/v2/validators (bare) is the NEW Validators page —
      // only the deep validators/:path+ tree is redirected, never the bare path.

      // Course transactions → course steppers
      { source: '/docs/protocol/v2/transactions/instance/owner/course/create', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/owner/teachers/manage', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/teacher/modules/manage', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/teacher/assignments/assess', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/student/assignment/commit', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/student/assignment/update', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/transactions/course/student/credential/claim', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },

      // Project transactions → project steppers
      { source: '/docs/protocol/v2/transactions/instance/owner/project/create', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/project/owner/managers/manage', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/project/manager/tasks/manage', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/transactions/project/manager/tasks/assess', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/transactions/project/contributor/task/commit', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/transactions/project/contributor/credential/claim', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },

      // Onboarding
      { source: '/docs/protocol/v2/transactions/global/general/access-token/mint', destination: '/docs/protocol/v2/sequences/onboarding', permanent: true },

      // Remaining transactions (index pages, anything unmapped) → sequences overview
      { source: '/docs/protocol/v2/transactions/:path+', destination: '/docs/protocol/v2/sequences', permanent: true },
      { source: '/docs/protocol/v2/transactions', destination: '/docs/protocol/v2/sequences', permanent: true },

      // Token stubs → the Validators page (tokens are now explained inline there)
      { source: '/docs/protocol/v2/tokens/:path+', destination: '/docs/protocol/v2/validators', permanent: true },
      { source: '/docs/protocol/v2/tokens', destination: '/docs/protocol/v2/validators', permanent: true },

      // Validator stub tree (deep only — the bare path is the new Validators page)
      { source: '/docs/protocol/v2/validators/:path+', destination: '/docs/protocol/v2/validators', permanent: true },

      // State-machine tree → the sequence stepper that re-composed each page's
      // content (specific first), with anything unmapped + the bare path falling
      // through to the protocol intro (which now carries the shared lifecycle).
      { source: '/docs/protocol/v2/state-machine/general/mint-access-token', destination: '/docs/protocol/v2/sequences/onboarding', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/owner-course-create', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/teacher-modules-manage', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/owner-teachers-manage', destination: '/docs/protocol/v2/sequences/course-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/student-assignment-commit', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/student-assignment-update', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/teacher-assignments-assess', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/course/student-credential-claim', destination: '/docs/protocol/v2/sequences/course-learn-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/owner-project-create', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/owner-managers-manage', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/manager-tasks-manage', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/user-treasury-add-funds', destination: '/docs/protocol/v2/sequences/project-author-operate', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/contributor-task-commit', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/contributor-task-action', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/manager-tasks-assess', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/project/contributor-credential-claim', destination: '/docs/protocol/v2/sequences/project-contribute-earn', permanent: true },
      { source: '/docs/protocol/v2/state-machine/:path+', destination: '/docs/protocol/v2', permanent: true },
      { source: '/docs/protocol/v2/state-machine', destination: '/docs/protocol/v2', permanent: true },

      // Trust & Verification zone — contract-verification + security-audit were
      // promoted out of Protocol to top-level horizontal pages (peer to the
      // Reference zone). Exact-match sources: no existing protocol/v2 rule
      // matches these paths, so they resolve in a single hop with no shadowing.
      { source: '/docs/protocol/v2/contract-verification', destination: '/docs/contract-verification', permanent: true },
      { source: '/docs/protocol/v2/security-audit', destination: '/docs/security-audit', permanent: true },
    ];
  },
};

export default withContentCollections(config);
