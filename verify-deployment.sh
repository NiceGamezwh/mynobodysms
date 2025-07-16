#!/bin/bash

echo "🔍 验证 Netlify 部署..."

# 检查环境变量
if [ -z "$NETLIFY_SITE_URL" ]; then
    echo "❌ NETLIFY_SITE_URL 环境变量未设置"
    exit 1
fi

SITE_URL=${NETLIFY_SITE_URL}

echo "🌐 测试站点: $SITE_URL"

# 测试主页
echo "📄 测试主页..."
curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200" && echo "✅ 主页正常" || echo "❌ 主页异常"

# 测试健康检查端点
echo "🏥 测试健康检查端点..."
for endpoint in "/api/health" "/.netlify/functions/health" "/health"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$endpoint")
    if [ "$status" = "200" ]; then
        echo "✅ $endpoint 正常 (HTTP $status)"
    else
        echo "❌ $endpoint 异常 (HTTP $status)"
    fi
done

# 测试登录端点
echo "🔐 测试登录端点..."
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"demo","password":"demo123"}' \
    "$SITE_URL/api/auth/login")

if [ "$status" = "200" ]; then
    echo "✅ 登录端点正常 (HTTP $status)"
else
    echo "❌ 登录端点异常 (HTTP $status)"
fi

echo "🎯 部署验证完成"
