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
};

export default withContentCollections(config);
