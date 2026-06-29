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
    ];
  },
};

export default withContentCollections(config);
