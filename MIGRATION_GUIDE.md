# 🚀 Railway PostgreSQL 迁移指南

## ✅ 第一步：数据已导出

你的 Supabase 数据已成功导出到 `supabase-backup.json`

**导出内容**：
- ✅ 2 个用户
- ✅ 5 个试卷
- ✅ 9 个标签
- ✅ 1 条答题记录
- ✅ 22 条学习记录

---

## 📋 第二步：在 Railway 添加 PostgreSQL

### 操作步骤：

1. **打开 Railway Dashboard**
   - 访问：https://railway.app/dashboard
   - 登录你的账号

2. **选择你的项目**
   - 找到 `rail-to-bachelor` 项目
   - 点击进入

3. **添加 PostgreSQL 数据库**
   - 点击右上角的 **"+ New"** 按钮
   - 选择 **"Database"**
   - 选择 **"Add PostgreSQL"**
   - 等待创建完成（约 30 秒）

4. **验证创建成功**
   - 你应该能看到一个新的 PostgreSQL 服务卡片
   - 状态显示为 "Active"（绿色）

---

## 🔗 第三步：获取数据库连接字符串

### 操作步骤：

1. **点击 PostgreSQL 服务卡片**
   - 在项目中找到 PostgreSQL 服务
   - 点击进入

2. **进入 Variables 标签**
   - 点击顶部的 "Variables" 标签

3. **复制 DATABASE_URL**
   - 找到 `DATABASE_URL` 变量
   - 点击复制按钮
   - 格式类似：
     ```
     postgresql://postgres:xxx@xxx.railway.internal:5432/railway
     ```

4. **保存连接字符串**
   - 暂时保存到记事本
   - 稍后会用到

---

## 🔄 第四步：连接数据库到应用

### 操作步骤：

1. **返回项目主页**
   - 点击左上角的项目名称
   - 回到项目概览

2. **进入应用服务**
   - 点击你的应用服务卡片（不是数据库）
   - 应该显示为 "rail-to-bachelor" 或类似名称

3. **检查环境变量**
   - 点击 "Variables" 标签
   - 查看是否已自动添加 `DATABASE_URL`
   
4. **如果没有自动添加**
   - 点击 "New Variable"
   - Variable: `DATABASE_URL`
   - Value: 粘贴刚才复制的连接字符串
   - 点击 "Add"

---

## 📊 第五步：初始化数据库结构

### 操作步骤：

1. **更新本地 .env 文件**
   
   打开 `.env` 文件，临时替换为 Railway 数据库：
   
   ```bash
   # 注释掉 Supabase
   # DATABASE_URL="postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres"
   
   # 使用 Railway（粘贴你复制的连接字符串）
   DATABASE_URL="postgresql://postgres:xxx@xxx.railway.internal:5432/railway"
   ```

2. **推送数据库结构**
   
   在终端运行：
   
   ```bash
   npx prisma db push
   ```
   
   你应该看到：
   ```
   ✔ Generated Prisma Client
   ✔ Database synchronized with Prisma schema
   ```

3. **导入数据**
   
   运行导入脚本：
   
   ```bash
   node import-data.js
   ```
   
   你应该看到：
   ```
   ✅ 数据导入完成！
   📊 导入统计:
      - 用户: 2
      - 试卷: 5
      - 标签: 9
      - 答题记录: 1
      - 学习记录: 22
   ```

---

## 🚀 第六步：部署到 Railway

### 操作步骤：

1. **提交代码**
   
   ```bash
   git add .
   git commit -m "迁移到 Railway PostgreSQL"
   git push
   ```

2. **等待自动部署**
   - Railway 会自动检测到代码更新
   - 开始重新部署
   - 查看部署日志

3. **验证部署成功**
   - 等待状态变为 "Active"
   - 看到 "Success" 消息

---

## ✅ 第七步：测试应用

### 操作步骤：

1. **访问应用**
   - 点击 Railway 提供的域名
   - 或在 Settings → Domains 中生成新域名

2. **测试功能**
   - [ ] 能否打开网站
   - [ ] 能否登录
   - [ ] 能否查看试卷
   - [ ] 能否答题
   - [ ] 能否查看错题集
   - [ ] 能否查看答题记录

3. **如果一切正常**
   - ✅ 迁移成功！
   - 可以继续使用

---

## 🔄 第八步：恢复本地开发环境

### 操作步骤：

1. **恢复 .env 文件**
   
   你可以选择：
   
   **选项 A：继续使用 Supabase（本地开发）**
   ```bash
   DATABASE_URL="postgresql://postgres:admin@db.nzgqjevjaeitfbppvnjq.supabase.co:5432/postgres"
   ```
   
   **选项 B：使用 Railway（需要 Railway CLI）**
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli
   
   # 登录
   railway login
   
   # 链接项目
   railway link
   
   # 运行开发服务器
   railway run npm run dev
   ```

2. **推送数据库结构**
   
   如果选择选项 A：
   ```bash
   npx prisma db push
   ```

---

## 📝 注意事项

### ⚠️ 重要提示

1. **备份文件**
   - `supabase-backup.json` 包含所有数据
   - 请妥善保管，不要删除
   - 不要提交到 Git（已在 .gitignore 中）

2. **环境变量**
   - Railway 会自动设置生产环境的 `DATABASE_URL`
   - 本地开发可以继续使用 Supabase
   - 或使用 Railway CLI 连接

3. **数据同步**
   - Railway 和 Supabase 是两个独立的数据库
   - 本地开发的数据不会自动同步到 Railway
   - 需要时可以重新导出导入

---

## 🎉 完成！

迁移完成后的好处：

- ✅ **部署稳定**：不再有连接问题
- ✅ **速度更快**：数据库和应用在同一网络
- ✅ **完全免费**：在 $5 免费额度内
- ✅ **自动备份**：Railway 自动备份数据
- ✅ **易于管理**：一个平台管理所有服务

---

## 🆘 遇到问题？

### 常见问题

**Q: 导入数据时出错**
- 确保已运行 `npx prisma db push`
- 检查 `DATABASE_URL` 是否正确
- 查看错误信息，可能是数据格式问题

**Q: 部署后无法连接数据库**
- 检查 Railway 中的 `DATABASE_URL` 环境变量
- 确保数据库和应用在同一个项目中
- 查看部署日志

**Q: 本地无法连接 Railway 数据库**
- Railway 数据库默认只能内部访问
- 使用 Railway CLI：`railway run npm run dev`
- 或继续使用 Supabase 做本地开发

---

## 📞 需要帮助

如果遇到任何问题，可以：
1. 查看 Railway 部署日志
2. 检查环境变量配置
3. 运行 `node test-db.js` 测试连接
