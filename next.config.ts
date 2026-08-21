import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // Development optimizations - comment out for production
  compress: false, // Disable compression in dev
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: false, // Disable ETag generation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Reduce cache time to 1 minute
    pagesBufferLength: 2, // Reduce pages buffer
  },
};

export default nextConfig;

