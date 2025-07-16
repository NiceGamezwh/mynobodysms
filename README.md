# NobodySMS - Nobody社区短信验证服务

专业的短信验证码服务平台，支持多项目管理和实时短信接收。

## 🚀 快速开始

### 环境要求

- Node.js 18.18.0 或更高版本
- npm 9.0.0 或更高版本

### 安装部署

1. **克隆项目**
\`\`\`bash
git clone <your-repo-url>
cd nobodysms-server
\`\`\`

2. **安装依赖**
\`\`\`bash
npm install
\`\`\`

3. **构建项目**
\`\`\`bash
npm run build
\`\`\`

4. **启动服务**
\`\`\`bash
npm start
\`\`\`

或使用提供的脚本：
\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 🐳 Docker 部署

\`\`\`bash
docker build -t nobodysms .
docker run -p 3000:3000 nobodysms
\`\`\`

## 📋 功能特性

- ✅ **用户认证** - 安全的登录系统
- ✅ **项目管理** - 支持多项目和专属项目
- ✅ **手机号获取** - 免费获取，收到短信才扣费
- ✅ **短信接收** - 实时获取验证码
- ✅ **手机号管理** - 释放和拉黑功能
- ✅ **多端点容错** - 自动切换备用 API
- ✅ **响应式设计** - 支持移动端和桌面端

## 🛠️ 技术栈

- **前端**: Next.js 15, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **部署**: Docker, Node.js

## 🔧 配置说明

### API 端点配置

系统已硬编码配置以下 API 端点：

1. 主要端点：`https://api.sqhyw.net:90`
2. 备用端点：`https://api.nnanx.com:90`

如需修改，请编辑 `lib/api-config.ts` 文件。

## 🚀 部署到服务器

### 方式一：直接部署

1. 上传代码到服务器
2. 安装 Node.js 18+
3. 运行部署脚本：
\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 方式二：使用 PM2

\`\`\`bash
npm install -g pm2
npm run build
pm2 start npm --name "nobodysms" -- start
\`\`\`

### 方式三：使用 Docker

\`\`\`bash
docker build -t nobodysms .
docker run -p 3000:3000 nobodysms
\`\`\`

## 📊 监控和日志

- 应用日志：控制台输出
- 进程监控：使用 PM2 或 Docker
- 健康检查：访问 `http://localhost:3000`

## 🔒 安全特性

- HTTP-only Cookies
- CSRF 保护
- 硬编码配置，无需环境变量
- API 端点验证

## 🆘 故障排除

### 常见问题

1. **端口被占用**
\`\`\`bash
lsof -i :3000
kill -9 <PID>
\`\`\`

2. **构建失败**
\`\`\`bash
rm -rf .next node_modules
npm install
npm run build
\`\`\`

3. **API 连接失败**
- 检查网络连接
- 确认 API 端点可访问
- 查看控制台日志

## 📞 技术支持

- 官方网站：https://nobody.xyz
- 技术支持：联系 Nobody 社区管理员

## 📄 许可证

本项目由 Nobody 社区开发维护。

---

**Every Nobody is Somebody** 🌟
