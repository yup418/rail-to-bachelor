# 🚀 项目部署指南

## 📋 部署方案：Vercel + Supabase（完全免费）

适合 5 个用户以内的小型项目，完全免费部署。

---

## 🎯 方案概述

- **前端 + 后端**：Vercel（免费）
- **数据库**：Supabase PostgreSQL（免费）
- **总成本**：$0/月

---

## 📝 部署步骤

### 1️⃣ 准备工作

#### 检查数据库连接
你已经在使用 Supabase，确认 `.env` 文件中有：
```env
DATABASE_URL="postgresql://..."
```

#### 确保项目可以构建
```bash
npm run build
```

如果构建成功，继续下一步。

---

### 2️⃣ 部署到 Vercel

#### 方法 A：通过 Vercel 网站（推荐）

1. **访问** [vercel.com](https://vercel.com)
2. **使用 GitHub 登录**
3. **点击 "Add New Project"**
4. **导入你的 GitHub 仓库**
   - 如果项目还没推送到 GitHub，先执行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
5. **配置项目**：
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **添加环境变量**：
   点击 "Environment Variables"，添加：
   ```
   DATABASE_URL = postgresql://...（从你的 .env 复制）
   NODE_ENV = production
   ```

7. **点击 "Deploy"**

#### 方法 B：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 按提示操作，设置环境变量
vercel env add DATABASE_URL

# 生产部署
vercel --prod
```

---

### 3️⃣ 配置自定义域名（可选）

Vercel 会自动分配一个域名：`your-project.vercel.app`

如果想用自己的域名：
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS

---

## 🔧 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名         | 值                 | 说明                |
| -------------- | ------------------ | ------------------- |
| `DATABASE_URL` | `postgresql://...` | Supabase 数据库连接 |
| `NODE_ENV`     | `production`       | 生产环境标识        |

---

## 📊 免费额度

### Vercel 免费计划
- ✅ 无限部署
- ✅ 100 GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 适合 5-10 个用户

### Supabase 免费计划
- ✅ 500 MB 数据库存储
- ✅ 1 GB 文件存储
- ✅ 50,000 月活用户
- ✅ 适合小型项目

---

## 🚨 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 数据库连接正常
- [ ] 用户可以登录
- [ ] 答题功能正常
- [ ] 错题集功能正常
- [ ] 答题记录保存正常

---

## 🐛 常见问题

### 1. 构建失败
**问题**：`npm run build` 失败
**解决**：
```bash
# 检查 TypeScript 错误
npm run build

# 修复后重新部署
git add .
git commit -m "Fix build errors"
git push
```

### 2. 数据库连接失败
**问题**：部署后无法连接数据库
**解决**：
- 检查 Vercel 环境变量中的 `DATABASE_URL` 是否正确
- 确保 Supabase 数据库正在运行
- 检查 Supabase 的 IP 白名单设置

### 3. 环境变量未生效
**问题**：环境变量在生产环境不生效
**解决**：
- 在 Vercel 项目设置中重新添加环境变量
- 重新部署项目

---

## 🔄 更新部署

每次代码更新后：

```bash
# 提交代码
git add .
git commit -m "Update features"
git push

# Vercel 会自动重新部署
```

或者手动触发：
```bash
vercel --prod
```

---

## 💡 优化建议

### 1. 启用 Vercel Analytics（免费）
- 在 Vercel 项目设置中启用
- 查看访问量、性能指标

### 2. 配置缓存
在 `next.config.js` 中：
```javascript
module.exports = {
  // ... 其他配置
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, must-revalidate',
        },
      ],
    },
  ],
}
```

### 3. 图片优化
使用 Next.js Image 组件：
```tsx
import Image from 'next/image'

<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

---

## 📱 监控和维护

### Vercel Dashboard
- 查看部署历史
- 监控性能
- 查看日志
- 管理环境变量

### Supabase Dashboard
- 监控数据库使用量
- 查看查询性能
- 管理数据

---

## 🎉 完成！

部署完成后，你的应用将在：
- **Vercel URL**: `https://your-project.vercel.app`
- **自定义域名**（如果配置）: `https://your-domain.com`

完全免费，适合 5 个用户使用！

---

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Supabase 文档: https://supabase.com/docs
- Next.js 文档: https://nextjs.org/docs
