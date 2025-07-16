#!/bin/bash

# 启动脚本
echo "🚀 启动 NobodySMS 服务..."

# 检查端口是否被占用
PORT=3000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "正在尝试停止现有服务..."
    pkill -f "next start"
    sleep 2
fi

# 设置环境变量
export NODE_ENV=production
export PORT=3000

# 启动服务
echo "🎯 启动服务在端口 $PORT..."
pnpm start &

# 保存进程 ID
PID=$!
echo $PID > .pid

echo "✅ 服务已启动!"
echo "🌐 访问地址: http://localhost:$PORT"
echo "📝 进程 ID: $PID"
echo "🛑 停止服务: ./stop.sh"
