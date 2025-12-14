#!/bin/bash

echo "🔍 诊断 Supabase 数据库连接问题..."
echo ""

# 1. 测试网络连接
echo "1️⃣ 测试网络连接..."
if ping -c 2 db.nzgqjevjaeitfbppvnjq.supabase.co > /dev/null 2>&1; then
    echo "   ✅ 网络连接正常"
else
    echo "   ❌ 无法 ping 通数据库服务器"
fi

# 2. 测试端口连接
echo ""
echo "2️⃣ 测试端口 5432..."
if nc -zv db.nzgqjevjaeitfbppvnjq.supabase.co 5432 2>&1 | grep -q succeeded; then
    echo "   ✅ 端口 5432 可访问"
else
    echo "   ❌ 端口 5432 无法访问"
    echo "   💡 这通常意味着数据库已暂停"
fi

# 3. 测试数据库连接
echo ""
echo "3️⃣ 测试数据库连接..."
node test-db.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 诊断结果："
echo ""
echo "如果看到 '❌ 端口 5432 无法访问'，说明："
echo "  • Supabase 数据库已暂停（免费版会自动暂停）"
echo "  • 需要在 Supabase Dashboard 中手动唤醒"
echo ""
echo "🔗 解决步骤："
echo "  1. 访问 https://supabase.com/dashboard"
echo "  2. 找到你的项目"
echo "  3. 点击 'Resume' 按钮"
echo "  4. 等待 1-2 分钟"
echo "  5. 重新运行此脚本测试"
echo ""
echo "💡 长期解决方案："
echo "  • 升级到 Supabase 付费计划（$25/月）"
echo "  • 或迁移到 Neon（免费且更稳定）"
echo ""
