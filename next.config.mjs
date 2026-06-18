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
  // Repositories flattened to a single page — redirect the old per-repo
  // subpage URLs to the index so existing links don't 404.
  async redirects() {
    return [
      { source: '/docs/repositories/on-chain/:slug*', destination: '/docs/repositories', permanent: true },
      { source: '/docs/repositories/apis/:slug*', destination: '/docs/repositories', permanent: true },
      { source: '/docs/repositories/templates/:slug*', destination: '/docs/repositories', permanent: true },
      { source: '/docs/repositories/docs/:slug*', destination: '/docs/repositories', permanent: true },
    ];
  },
};

export default withContentCollections(config);
