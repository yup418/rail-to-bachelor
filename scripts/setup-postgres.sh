#!/bin/bash

echo "🚀 PostgreSQL 数据库迁移设置"
echo "================================"
echo ""

# 检查是否已有 PostgreSQL DATABASE_URL
if grep -q "postgresql://" .env 2>/dev/null; then
    echo "✅ 检测到 PostgreSQL 连接字符串"
    DATABASE_URL=$(grep "DATABASE_URL" .env | cut -d '=' -f2 | tr -d '"')
    echo "当前连接: ${DATABASE_URL:0:50}..."
    echo ""
    read -p "是否使用现有连接？(y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo ""
        echo "请提供新的 PostgreSQL 连接字符串："
        echo "格式: postgresql://username:password@host:port/database"
        echo "示例: postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
        echo ""
        read -p "DATABASE_URL: " new_url
        if [ ! -z "$new_url" ]; then
            # 更新 .env 文件
            if grep -q "DATABASE_URL" .env; then
                sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$new_url\"|" .env
            else
                echo "DATABASE_URL=\"$new_url\"" >> .env
            fi
            echo "✅ 已更新 DATABASE_URL"
        fi
    fi
else
    echo "❌ 未找到 PostgreSQL 连接字符串"
    echo ""
    echo "请选择数据库来源："
    echo "1. Supabase (推荐，完全免费)"
    echo "2. 本地 PostgreSQL"
    echo "3. 其他 PostgreSQL 服务"
    echo ""
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            echo ""
            echo "📝 Supabase 设置步骤："
            echo "1. 访问 https://supabase.com"
            echo "2. 使用 GitHub 登录"
            echo "3. 创建新项目"
            echo "4. 在 Settings → Database 中获取连接字符串"
            echo ""
            read -p "请输入 Supabase 连接字符串: " supabase_url
            if [ ! -z "$supabase_url" ]; then
                if grep -q "DATABASE_URL" .env; then
                    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$supabase_url\"|" .env
                else
                    echo "DATABASE_URL=\"$supabase_url\"" >> .env
                fi
                echo "✅ 已设置 Supabase 连接"
            fi
            ;;
        2)
            echo ""
            read -p "请输入本地 PostgreSQL 连接字符串: " local_url
            if [ ! -z "$local_url" ]; then
                if grep -q "DATABASE_URL" .env; then
                    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$local_url\"|" .env
                else
                    echo "DATABASE_URL=\"$local_url\"" >> .env
                fi
                echo "✅ 已设置本地 PostgreSQL 连接"
            fi
            ;;
        3)
            echo ""
            read -p "请输入 PostgreSQL 连接字符串: " custom_url
            if [ ! -z "$custom_url" ]; then
                if grep -q "DATABASE_URL" .env; then
                    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$custom_url\"|" .env
                else
                    echo "DATABASE_URL=\"$custom_url\"" >> .env
                fi
                echo "✅ 已设置 PostgreSQL 连接"
            fi
            ;;
    esac
fi

echo ""
echo "🔧 下一步：运行数据库迁移"
echo "================================"
read -p "是否现在运行迁移？(y/n): " run_migration

if [ "$run_migration" = "y" ]; then
    echo ""
    echo "正在运行迁移..."
    npx prisma migrate dev --name init_postgresql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 迁移成功！"
        echo ""
        read -p "是否运行 seed 初始化数据？(y/n): " run_seed
        if [ "$run_seed" = "y" ]; then
            echo ""
            echo "正在运行 seed..."
            npx prisma db seed
            echo ""
            echo "✅ Seed 完成！"
        fi
    else
        echo ""
        echo "❌ 迁移失败，请检查连接字符串是否正确"
    fi
fi

echo ""
echo "完成！"

