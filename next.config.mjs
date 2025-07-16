/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Netlify compatibility
  // output: 'standalone', // This causes issues on Netlify
  
  // Netlify-specific configuration
  trailingSlash: false,
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization - required for Netlify
  images: {
    unoptimized: true, // Required for static export compatibility
  },
  
  // Compression
  compress: true,
  
  // CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/health',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
  
  // Rewrites for health check
  async rewrites() {
    return [
      {
        source: '/health-check',
        destination: '/api/health',
      },
    ]
  },
}

export default nextConfig
