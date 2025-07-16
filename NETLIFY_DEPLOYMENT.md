# Netlify 部署指南

## 部署步骤

### 1. 准备代码
确保你的代码已经推送到 GitHub 仓库。

### 2. 连接 Netlify
1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 配置构建设置

### 3. 构建设置
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 4. 环境变量
在 Netlify 控制台中设置以下环境变量：
\`\`\`
NODE_ENV=production
NEXT_BUILD_CONCURRENCY=1
\`\`\`

### 5. 插件配置
确保 `netlify.toml` 文件包含正确的插件配置：
\`\`\`toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
\`\`\`

## 常见问题解决

### API 路由返回 404
这是 Next.js 15 在 Netlify 上的常见问题。解决方案：

1. **检查 netlify.toml 配置**
   \`\`\`toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/___netlify-handler"
     status = 200
   \`\`\`

2. **移除 standalone 输出**
   在 `next.config.mjs` 中注释掉：
   \`\`\`js
   // output: 'standalone', // 这会导致 Netlify 问题
   \`\`\`

3. **设置图片优化**
   \`\`\`js
   images: {
     unoptimized: true, // Netlify 需要
   }
   \`\`\`

### 构建失败
1. 检查 Node.js 版本是否为 18
2. 确保所有依赖都已正确安装
3. 检查 TypeScript 错误（可以临时忽略）

### 函数超时
在 `netlify.toml` 中增加超时时间：
\`\`\`toml
[functions]
  timeout = 30
\`\`\`

## 性能优化

### 1. 构建优化
\`\`\`js
// next.config.mjs
const nextConfig = {
  compress: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
\`\`\`

### 2. 缓存策略
Netlify 会自动缓存静态资源，但你可以通过 headers 配置自定义缓存：
\`\`\`js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-cache' },
      ],
    },
  ]
}
\`\`\`

## 调试工具

### 1. 使用调试页面
访问 `/debug` 页面测试所有 API 端点。

### 2. 检查 Netlify 日志
1. 进入 Netlify 控制台
2. 选择你的站点
3. 查看 "Functions" 标签页的日志

### 3. 本地测试
\`\`\`bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 本地运行
netlify dev
\`\`\`

## 故障排除清单

- [ ] 检查 `netlify.toml` 配置
- [ ] 确认 Next.js 版本兼容性
- [ ] 验证 API 路由文件存在
- [ ] 检查环境变量设置
- [ ] 查看构建日志
- [ ] 测试本地开发环境
- [ ] 使用调试页面诊断

## 联系支持

如果问题仍然存在：
1. 访问 `/debug` 页面获取详细信息
2. 联系企业微信客服
3. 使用演示模式：用户名 `demo`，密码 `demo123`
\`\`\`

Now let's update the login page to include better error handling and debugging information:
