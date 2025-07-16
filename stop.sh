#!/bin/bash

# 停止 Next.js 应用 (如果通过 pnpm start 启动)
echo "Stopping Next.js application..."
# 查找并杀死 Next.js 进程
# 注意：这可能需要根据实际情况调整，例如查找端口或进程名
# pkill -f "next start"
# 或者如果是在 Docker 中运行，则使用 Docker 命令停止
echo "If running in Docker, use 'docker stop <container_name>'."
echo "Otherwise, manually stop the process that started with 'pnpm start'."
