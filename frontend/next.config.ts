import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alphaai.alphabit.club',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
