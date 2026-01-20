/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for the resume app
  basePath: '/resume',

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@anthropic-ai/sdk'],
  },
}

export default nextConfig
