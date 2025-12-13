# 🚀 Railway 部署指南

## 📋 Railway 简介

Railway 是一个现代化的应用部署平台，在国内访问稳定。

- ✅ 国内可访问
- ✅ $5/月免费额度
- ✅ 支持 Next.js
- ✅ 自动 HTTPS
- ✅ 简单易用

---

## 🎯 部署步骤

### 1️⃣ 注册 Railway 账号

1. **访问 Railway**
   - 打开：https://railway.app
   - 点击 "Start a New Project" 或 "Login"

2. **使用 GitHub 登录**
   - 点击 "Login with GitHub"
   - 授权 Railway 访问你的 GitHub

3. **完成注册**
   - 首次登录会要求验证邮箱
   - 检查邮箱并点击验证链接

---

### 2️⃣ 创建新项目

1. **进入 Dashboard**
   - 登录后会看到 "New Project" 按钮
   - 点击 "New Project"

2. **选择部署方式**
   - 选择 "Deploy from GitHub repo"
   - 或点击 "Deploy from GitHub"

3. **授权 GitHub 仓库**
   - 如果是第一次，需要授权 Railway 访问 GitHub
   - 点击 "Configure GitHub App"
   - 选择 "All repositories" 或只选择 `rail-to-bachelor`
   - 点击 "Install & Authorize"

---

### 3️⃣ 导入项目

1. **选择仓库**
   - 在仓库列表中找到 `yup418/rail-to-bachelor`
   - 点击仓库名称

2. **确认部署**
   - Railway 会自动检测到 Next.js
   - 点击 "Deploy Now" 或 "Add variables"

---

### 4️⃣ 添加环境变量

**重要！必须添加数据库连接**

1. **进入项目设置**
   - 点击项目卡片
   - 找到 "Variables" 标签

2. **添加变量**
   
   点击 "New Variable"，添加以下内容：

   **变量 1：**
   - Variable: `DATABASE_URL`
   - Value: `postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres`

   **变量 2：**
   - Variable: `NODE_ENV`
   - Value: `production`

3. **保存并重新部署**
   - 点击右上角的 "Deploy" 按钮
   - 或等待自动重新部署

---

### 5️⃣ 等待部署

1. **查看构建日志**
   - 点击 "Deployments" 标签
   - 点击最新的部署
   - 查看构建日志

2. **等待完成**
   - 构建过程约 2-3 分钟
   - 看到 "Success" 表示部署成功

3. **部署成功**
   - 状态变为 "Active"
   - 显示绿色的勾号 ✅

---

### 6️⃣ 生成公开域名

1. **进入 Settings**
   - 点击项目
   - 找到 "Settings" 标签

2. **生成域名**
   - 找到 "Domains" 部分
   - 点击 "Generate Domain"
   - Railway 会自动生成一个域名，类似：
     ```
     rail-to-bachelor-production.up.railway.app
     ```

3. **测试访问**
   - 点击生成的域名
   - 应该能看到你的网站

---

## 🎨 可选：绑定自定义域名

如果你有自己的域名：

1. **在 Railway 中添加域名**
   - 进入 Settings → Domains
   - 点击 "Custom Domain"
   - 输入你的域名（如 `example.com`）

2. **配置 DNS**
   - 在域名提供商处添加 CNAME 记录
   - 指向 Railway 提供的地址

3. **等待生效**
   - DNS 生效需要几分钟到几小时
   - 生效后可以通过自定义域名访问

---

## 💰 费用说明

### 免费额度

Railway 提供 **$5/月** 的免费额度：

- ✅ 对于小型项目（5个用户）完全够用
- ✅ 包含计算资源和带宽
- ✅ 超出后才收费

### 预估使用量

对于你的项目：
- **预计月费用**：$0 - $2
- **免费额度**：$5/月
- **结论**：**完全免费**

### 监控使用量

1. **查看用量**
   - 进入 Dashboard
   - 点击右上角的头像
   - 选择 "Usage"

2. **设置预算提醒**
   - 可以设置用量提醒
   - 避免意外超支

---

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push
```

Railway 会自动检测并重新部署！

---

## 🐛 常见问题

### 1. 构建失败

**问题**：部署时构建失败

**解决**：
- 检查环境变量是否正确
- 查看构建日志找到错误
- 确保 `DATABASE_URL` 已添加

### 2. 数据库连接失败

**问题**：网站打开但无法连接数据库

**解决**：
- 检查 `DATABASE_URL` 是否正确
- 确保 Supabase 数据库正在运行
- 检查 Supabase 的 IP 白名单设置（Railway 的 IP 可能需要添加）

### 3. 域名无法访问

**问题**：生成的域名无法访问

**解决**：
- 等待几分钟，域名需要时间生效
- 检查部署状态是否为 "Active"
- 查看部署日志是否有错误

### 4. 超出免费额度

**问题**：担心超出 $5 免费额度

**解决**：
- 设置用量提醒
- 监控使用情况
- 对于 5 个用户，基本不会超出

---

## 📊 Railway vs Vercel 对比

| 特性       | Railway | Vercel         |
| ---------- | ------- | -------------- |
| 国内访问   | ✅ 稳定  | ⚠️ 部分地区较慢 |
| 免费额度   | $5/月   | 100GB/月       |
| 配置难度   | 简单    | 简单           |
| 自动部署   | ✅       | ✅              |
| 自定义域名 | ✅       | ✅              |

---

## 📞 需要帮助？

- Railway 文档：https://docs.railway.app
- Discord 社区：https://discord.gg/railway

---

## ✅ 完成检查清单

部署完成后，检查以下功能：

- [ ] 网站可以访问
- [ ] 用户可以登录
- [ ] 答题功能正常
- [ ] 错题集功能正常
- [ ] 答题记录保存正常
- [ ] 管理员功能正常

---

## 🎉 部署成功！

恭喜！你的专升本学习平台已成功部署到 Railway！

**网站地址**：`https://rail-to-bachelor-production.up.railway.app`

现在可以分享给用户使用了！🚀

---

## 💡 提示

- Railway 在国内访问稳定
- 免费额度对小项目完全够用
- 可以随时监控使用量
- 支持绑定自定义域名
