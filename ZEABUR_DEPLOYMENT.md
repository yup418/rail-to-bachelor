# 🚀 Zeabur 部署指南

## 📋 Zeabur 简介

Zeabur 是一个现代化的应用部署平台，类似 Vercel，但在国内访问更稳定。

- ✅ 国内访问稳定
- ✅ 免费额度充足
- ✅ 支持 Next.js
- ✅ 自动 HTTPS
- ✅ 全球 CDN

---

## 🎯 部署步骤

### 1️⃣ 注册 Zeabur 账号

1. **访问 Zeabur**
   - 打开：https://zeabur.com
   - 点击右上角 "Sign Up" 或 "登录"

2. **使用 GitHub 登录**
   - 点击 "Continue with GitHub"
   - 授权 Zeabur 访问你的 GitHub

3. **完成注册**
   - 首次登录会要求设置用户名
   - 填写后点击 "Continue"

---

### 2️⃣ 创建新项目

1. **进入 Dashboard**
   - 登录后会看到项目列表
   - 点击 "Create Project" 或 "新建项目"

2. **选择部署方式**
   - 选择 "Deploy from GitHub"
   - 或点击 "Git" 图标

3. **授权 GitHub 仓库**
   - 如果是第一次，需要授权 Zeabur 访问 GitHub
   - 点击 "Install Zeabur" 或 "安装"
   - 选择 "All repositories" 或只选择 `rail-to-bachelor`

---

### 3️⃣ 导入项目

1. **选择仓库**
   - 在仓库列表中找到 `yup418/rail-to-bachelor`
   - 点击 "Import" 或 "导入"

2. **配置项目**
   - Project Name: `rail-to-bachelor`
   - Branch: `main`
   - Root Directory: `./`

3. **框架检测**
   - Zeabur 会自动检测到 Next.js
   - 无需手动配置

---

### 4️⃣ 添加环境变量

**重要！必须添加数据库连接**

1. **进入项目设置**
   - 点击项目卡片
   - 找到 "Environment Variables" 或 "环境变量"

2. **添加变量**
   
   点击 "Add Variable" 或 "添加变量"，添加以下内容：

   | Key            | Value                                                                           |
   | -------------- | ------------------------------------------------------------------------------- |
   | `DATABASE_URL` | `postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres` |
   | `NODE_ENV`     | `production`                                                                    |

3. **保存**
   - 点击 "Save" 或 "保存"

---

### 5️⃣ 部署项目

1. **触发部署**
   - 添加环境变量后，Zeabur 会自动开始部署
   - 或者点击 "Deploy" 按钮

2. **等待构建**
   - 构建过程约 2-3 分钟
   - 可以点击 "Logs" 查看构建日志

3. **部署成功**
   - 看到 "Deployed" 或 "部署成功" 状态
   - 会显示一个绿色的勾号 ✅

---

### 6️⃣ 访问网站

1. **获取 URL**
   - 在项目页面找到 "Domain" 或 "域名"
   - 默认会分配一个域名，类似：
     ```
     https://rail-to-bachelor.zeabur.app
     ```

2. **测试访问**
   - 点击 URL 或复制到浏览器
   - 应该能看到你的网站

3. **国内访问测试**
   - 用手机访问测试
   - 速度应该比 Vercel 快

---

## 🎨 可选：绑定自定义域名

如果你有自己的域名：

1. **在 Zeabur 中添加域名**
   - 进入项目设置
   - 找到 "Domains" 或 "域名"
   - 点击 "Add Domain" 或 "添加域名"
   - 输入你的域名（如 `example.com`）

2. **配置 DNS**
   - 在域名提供商处添加 CNAME 记录
   - 指向 Zeabur 提供的地址

3. **等待生效**
   - DNS 生效需要几分钟到几小时
   - 生效后可以通过自定义域名访问

---

## 📊 免费额度

Zeabur 免费计划包括：

- ✅ 无限项目
- ✅ 每月 5 美元额度（足够小型项目）
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署

**对于 5 个用户的项目，完全免费！**

---

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push
```

Zeabur 会自动检测并重新部署！

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
- 检查 Supabase 的 IP 白名单设置

### 3. 页面 404

**问题**：访问某些页面显示 404

**解决**：
- 检查路由配置
- 重新部署项目
- 清除浏览器缓存

---

## 📞 需要帮助？

- Zeabur 文档：https://zeabur.com/docs
- Discord 社区：https://discord.gg/zeabur

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

恭喜！你的专升本学习平台已成功部署到 Zeabur！

**网站地址**：`https://rail-to-bachelor.zeabur.app`（或你的自定义域名）

现在可以分享给用户使用了！🚀
