/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境优化配置
  experimental: {
    // 移除过时的 serverComponentsExternalPackages
  },
  // 确保 API 路由正常工作
  output: 'standalone',
  // 构建优化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 图片优化
  images: {
    unoptimized: false,
    domains: [],
  },
  // 压缩优化 - 移除过时的 swcMinify
  compress: true,
  // 确保 API 路由在生产环境中正确工作
  trailingSlash: false,
  // 服务器部署配置
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
    ]
  },
  // 重写规则以处理API请求
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ]
  },
}

export default nextConfig
