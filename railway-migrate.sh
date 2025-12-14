# Railway 数据库迁移脚本
# 这个脚本会在 Railway 部署时自动运行

echo "🚀 开始 Railway 数据库迁移..."

# 1. 生成 Prisma 客户端
echo "📦 生成 Prisma 客户端..."
npx prisma generate

# 2. 推送数据库结构
echo "📊 推送数据库结构..."
npx prisma db push --accept-data-loss

# 3. 导入数据（如果备份文件存在）
if [ -f "supabase-backup.json" ]; then
    echo "📥 导入数据..."
    node import-data.js
else
    echo "⚠️  未找到备份文件，跳过数据导入"
fi

echo "✅ 迁移完成！"
