# 🚀 使用 Railway PostgreSQL 数据库

## 为什么推荐使用 Railway PostgreSQL？

- ✅ **完全免费**（在 $5 额度内）
- ✅ **无连接问题**（同一网络内）
- ✅ **自动备份**
- ✅ **更快的速度**（无跨区域延迟）
- ✅ **无需配置 IP 白名单**

---

## 📋 迁移步骤

### 1️⃣ 在 Railway 中添加 PostgreSQL

1. **进入你的 Railway 项目**
   - 打开 Railway Dashboard
   - 选择你的项目

2. **添加 PostgreSQL 服务**
   - 点击 "+ New" 按钮
   - 选择 "Database"
   - 选择 "Add PostgreSQL"

3. **等待创建完成**
   - Railway 会自动创建数据库
   - 自动生成连接字符串

### 2️⃣ 连接数据库到应用

1. **自动连接**
   - Railway 会自动将数据库连接到你的应用
   - 环境变量 `DATABASE_URL` 会自动设置

2. **验证连接**
   - 进入应用的 "Variables" 标签
   - 应该能看到 `DATABASE_URL` 已自动添加
   - 格式类似：`postgresql://postgres:xxx@xxx.railway.internal:5432/railway`

### 3️⃣ 迁移数据（如果需要）

如果你在 Supabase 有数据需要迁移：

#### 方法 A：使用 pg_dump（推荐）

```bash
# 1. 导出 Supabase 数据
pg_dump "postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres" > backup.sql

# 2. 导入到 Railway
# 从 Railway 获取新的 DATABASE_URL
psql "postgresql://postgres:xxx@xxx.railway.internal:5432/railway" < backup.sql
```

#### 方法 B：使用 Prisma（简单）

```bash
# 1. 更新 .env 为 Railway 数据库
DATABASE_URL="postgresql://postgres:xxx@xxx.railway.internal:5432/railway"

# 2. 推送 schema
npx prisma db push

# 3. 手动迁移重要数据（用户、题目等）
```

### 4️⃣ 重新部署

1. **触发部署**
   - 推送代码到 GitHub
   - 或在 Railway 点击 "Deploy"

2. **验证**
   - 检查部署日志
   - 确认数据库连接成功

---

## 🎯 完整迁移示例

### 步骤 1：导出 Supabase 数据

```bash
# 安装 PostgreSQL 工具（如果没有）
brew install postgresql

# 导出数据
pg_dump "postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  > supabase_backup.sql
```

### 步骤 2：在 Railway 添加 PostgreSQL

1. Railway Dashboard → 你的项目
2. 点击 "+ New" → "Database" → "Add PostgreSQL"
3. 等待创建完成

### 步骤 3：获取 Railway 数据库连接

1. 点击 PostgreSQL 服务
2. 进入 "Variables" 标签
3. 复制 `DATABASE_URL`

### 步骤 4：导入数据到 Railway

```bash
# 使用 Railway CLI（推荐）
railway login
railway link  # 选择你的项目
railway run psql < supabase_backup.sql

# 或直接使用 psql
psql "你的Railway数据库URL" < supabase_backup.sql
```

### 步骤 5：更新本地开发环境

```bash
# 更新 .env 文件
# 使用 Railway 提供的 DATABASE_URL
# 或继续使用 Supabase（本地开发）
```

---

## 💡 最佳实践

### 开发环境

```bash
# .env.local（本地开发）
DATABASE_URL="postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres"
```

### 生产环境

```bash
# Railway 环境变量（自动设置）
DATABASE_URL="postgresql://postgres:xxx@xxx.railway.internal:5432/railway"
```

---

## 🔍 故障排查

### 问题 1：连接失败

**检查**：
- Railway PostgreSQL 是否已创建
- `DATABASE_URL` 是否正确设置
- 应用是否已重新部署

### 问题 2：数据丢失

**解决**：
- 确保已导出 Supabase 数据
- 检查导入日志是否有错误
- 验证表结构是否正确

### 问题 3：本地无法连接 Railway 数据库

**说明**：
- Railway 数据库默认只能从 Railway 内部访问
- 本地开发继续使用 Supabase
- 或使用 Railway CLI：`railway run npm run dev`

---

## ✅ 迁移检查清单

- [ ] 在 Railway 添加 PostgreSQL
- [ ] 导出 Supabase 数据
- [ ] 导入数据到 Railway
- [ ] 验证 `DATABASE_URL` 环境变量
- [ ] 重新部署应用
- [ ] 测试所有功能
- [ ] 备份 Railway 数据库

---

## 🎉 完成！

使用 Railway PostgreSQL 后：
- ✅ 不再有连接问题
- ✅ 更快的响应速度
- ✅ 完全在免费额度内
- ✅ 自动备份和恢复
