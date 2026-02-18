import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Development optimizations - comment out for production
  compress: false, // Disable compression in dev
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: false, // Disable ETag generation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Reduce cache time to 1 minute
    pagesBufferLength: 2, // Reduce pages buffer
  },
  // Experimental optimizations
  // swcMinify: false, // Disable SWC minification in dev - commented out due to TypeScript error
  // Disable features not needed in dev
  // experimental: {
  //   optimizeCss: false, // Disable CSS optimization
  //   optimizePackageImports: false, // Disable package imports optimization
  //   optimizeImages: false, // Disable image optimization
  //   optimizeFonts: false, // Disable font optimization
  // },
};

export default nextConfig;
