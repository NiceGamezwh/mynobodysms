#!/bin/bash

# NobodySMS 服务器部署脚本
echo "🚀 开始部署 NobodySMS 到服务器..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

if [[ ! "$node_version" =~ ^v1[89] ]] && [[ ! "$node_version" =~ ^v2[0-9] ]]; then
    echo "❌ 需要 Node.js 18+ 版本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "✅ 构建成功!"
else
    echo "❌ 构建失败!"
    exit 1
fi

# 启动服务
echo "🎯 启动服务..."
npm start &

# 获取进程 ID
PID=$!
echo "🆔 服务进程 ID: $PID"

# 等待服务启动
sleep 5

# 检查服务是否正在运行
if ps -p $PID > /dev/null; then
    echo "✅ NobodySMS 服务已成功启动!"
    echo "🌐 访问地址: http://localhost:3000"
    echo "📝 进程 ID: $PID"
    echo "🛑 停止服务: kill $PID"
else
    echo "❌ 服务启动失败!"
    exit 1
fi
