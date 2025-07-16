#!/bin/bash

# 停止脚本
echo "🛑 停止 NobodySMS 服务..."

# 从 PID 文件读取进程 ID
if [ -f .pid ]; then
    PID=$(cat .pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "✅ 服务已停止 (PID: $PID)"
        rm .pid
    else
        echo "⚠️  进程 $PID 不存在"
        rm .pid
    fi
else
    echo "⚠️  未找到 PID 文件，尝试停止所有相关进程..."
    pkill -f "next start"
    echo "✅ 已尝试停止所有相关进程"
fi
