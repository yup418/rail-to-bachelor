#!/bin/bash

# 🚀 快速部署脚本

echo "🚀 开始部署到 Vercel..."
echo ""

# 1. 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm i -g vercel
fi

# 2. 检查构建
echo "🔨 检查项目构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败，请修复错误后重试"
    exit 1
fi

# 3. 部署
echo ""
echo "🚀 开始部署..."
vercel --prod

echo ""
echo "✅ 部署完成！"
echo "📱 访问 Vercel Dashboard 查看你的应用"
