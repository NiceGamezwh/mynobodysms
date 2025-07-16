#!/bin/bash

# NobodySMS 服务器部署脚本 - 增强版
echo "🚀 开始部署 NobodySMS 到服务器..."

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查 Node.js 版本
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "需要 Node.js 18+ 版本，当前版本: $(node -v)"
        exit 1
    fi
    
    log_success "Node.js 版本检查通过: $(node -v)"
    
    # 检查 npm 版本
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "npm 版本: $(npm -v)"
    
    # 检查端口是否被占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 3000 已被占用，正在尝试停止现有服务..."
        pkill -f "next start" || true
        sleep 3
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 设置环境变量
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    
    # 清理之前的构建
    rm -rf .next
    
    # 构建项目
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "项目构建成功"
    else
        log_error "项目构建失败"
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 5
    
    # 检查健康端点
    for i in {1..10}; do
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_success "健康检查通过"
            return 0
        fi
        log_info "等待服务启动... ($i/10)"
        sleep 2
    done
    
    log_error "健康检查失败，服务可能未正常启动"
    return 1
}

# 启动服务
start_service() {
    log_info "启动服务..."
    
    # 设置环境变量
    export NODE_ENV=production
    export PORT=3000
    export HOSTNAME=0.0.0.0
    
    # 启动服务（后台运行）
    nohup npm start > nobodysms.log 2>&1 &
    PID=$!
    
    # 保存进程 ID
    echo $PID > nobodysms.pid
    
    log_success "服务已启动，进程 ID: $PID"
    log_info "日志文件: nobodysms.log"
    log_info "PID 文件: nobodysms.pid"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 NobodySMS 部署完成！"
    echo ""
    echo "📋 部署信息:"
    echo "  🌐 访问地址: http://localhost:3000"
    echo "  🌐 健康检查: http://localhost:3000/health"
    echo "  📝 日志文件: $(pwd)/nobodysms.log"
    echo "  🆔 进程文件: $(pwd)/nobodysms.pid"
    echo ""
    echo "📋 管理命令:"
    echo "  🔍 查看日志: tail -f nobodysms.log"
    echo "  🛑 停止服务: kill \$(cat nobodysms.pid)"
    echo "  🔄 重启服务: ./server-deploy.sh"
    echo ""
    echo "📞 技术支持:"
    echo "  💬 客服微信: NobodySMS"
    echo "  🌐 官方网站: https://nobody.xyz"
}

# 主函数
main() {
    log_info "开始 NobodySMS 服务器部署流程"
    
    check_requirements
    install_dependencies
    build_project
    start_service
    
    if health_check; then
        show_deployment_info
    else
        log_error "部署过程中出现问题，请检查日志文件"
        exit 1
    fi
}

# 执行主函数
main "$@"
