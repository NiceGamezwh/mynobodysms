#!/bin/bash

# NobodySMS 服务停止脚本
echo "🛑 停止 NobodySMS 服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 从 PID 文件停止服务
if [ -f "nobodysms.pid" ]; then
    PID=$(cat nobodysms.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        sleep 3
        
        # 检查是否成功停止
        if ps -p $PID > /dev/null 2>&1; then
            log_info "强制停止进程..."
            kill -9 $PID
        fi
        
        log_success "服务已停止 (PID: $PID)"
        rm nobodysms.pid
    else
        log_info "进程 $PID 不存在"
        rm nobodysms.pid
    fi
else
    log_info "未找到 PID 文件，尝试停止所有相关进程..."
    pkill -f "next start" || true
    pkill -f "node.*server.js" || true
    log_success "已尝试停止所有相关进程"
fi

# 检查端口是否释放
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_error "端口 3000 仍被占用，可能需要手动处理"
else
    log_success "端口 3000 已释放"
fi

echo "✅ NobodySMS 服务停止完成"
