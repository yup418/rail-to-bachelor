# Railway 环境变量配置指南

## 🔑 需要在 Railway 中设置的环境变量

### 方法 1：使用 Pooler（推荐用于生产环境）

```bash
DATABASE_URL=postgresql://postgres:admin@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

### 方法 2：使用 Direct Connection

```bash
DATABASE_URL=postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres
```

### 其他必要变量

```bash
NODE_ENV=production
```

## 📝 如何在 Railway 中设置

1. 进入 Railway Dashboard
2. 选择你的项目
3. 点击 "Variables" 标签
4. 点击 "New Variable"
5. 添加上述变量
6. 点击 "Deploy" 重新部署

## 🔍 验证环境变量

部署后，在 Railway 的部署日志中应该能看到：
```
✓ Environment variables loaded
✓ Database connection successful
```

## ⚠️ 注意事项

- 不要在代码中硬编码数据库密码
- 确保 .env 文件在 .gitignore 中
- Railway 会自动从环境变量中读取配置
