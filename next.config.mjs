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

      // guides/ dismantled across api/ and apps-tooling/ — CLI first (it lived
      // under developers/ but belongs to Apps & Tooling), then the rest.
      { source: '/docs/guides/developers/cli/:path*', destination: '/docs/apps-tooling/cli/:path*', permanent: true },
      { source: '/docs/guides/developers/:path*', destination: '/docs/api/guides/:path*', permanent: true },
      { source: '/docs/guides/courses/:path*', destination: '/docs/apps-tooling/courses/:path*', permanent: true },
      { source: '/docs/guides/projects/:path*', destination: '/docs/apps-tooling/projects/:path*', permanent: true },
      { source: '/docs/guides/contributors/:path*', destination: '/docs/apps-tooling/contributors/:path*', permanent: true },
      { source: '/docs/guides/getting-started', destination: '/docs/apps-tooling/explore-getting-started', permanent: true },
      { source: '/docs/guides/roles', destination: '/docs/apps-tooling/roles', permanent: true },
      { source: '/docs/guides/preprod-wallet-setup', destination: '/docs/apps-tooling/preprod-wallet-setup', permanent: true },
      { source: '/docs/guides', destination: '/docs/apps-tooling', permanent: true },

      // Top-level pages moved under api/.
      { source: '/docs/getting-started', destination: '/docs/api/getting-started', permanent: true },
      { source: '/docs/building-on-andamio', destination: '/docs/api/building-on-andamio', permanent: true },
      { source: '/docs/reference/:path*', destination: '/docs/api/reference/:path*', permanent: true },

      // Apps & Tooling.
      { source: '/docs/demo', destination: '/docs/apps-tooling/demo', permanent: true },
      { source: '/docs/sdk/:path*', destination: '/docs/apps-tooling/sdk/:path*', permanent: true },

      // Developer Community. The repositories wildcard also absorbs the old
      // flattened per-repo subpages (on-chain/apis/templates/docs), so those
      // legacy redirects collapse into this one rule pointing at the new home.
      { source: '/docs/pioneers/:path*', destination: '/docs/developer-community/pioneers/:path*', permanent: true },
      { source: '/docs/repositories/:path*', destination: '/docs/developer-community/repositories', permanent: true },

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
    ];
  },
};

export default withContentCollections(config);
