import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/erp-frontend-demo',
  assetPrefix: '/erp-frontend-demo/',
};

export default nextConfig;
