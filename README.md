# 🎓 陕西专升本学习平台

一个功能完整的专升本学习平台，支持在线答题、错题集、答题记录等功能。

## ✨ 主要功能

- 📝 **在线答题**：支持高等数学和大学英语真题练习
- 🎯 **智能管理**：管理员可以编辑、删除题目
- 📊 **答题记录**：自动保存答题历史和成绩
- ❌ **错题集**：自动收集错题，支持筛选和复习
- ⏰ **倒计时**：实时显示距离考试的倒计时
- 🎮 **游戏化**：等级系统、经验值、连续打卡

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 创建管理员账号

```bash
# 运行创建用户脚本
npx tsx scripts/create-user.ts
```

## 📦 部署

### 免费部署（推荐）

使用 **Vercel + Supabase** 完全免费部署，适合 5-10 个用户。

详细步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署

```bash
# 方法 1：使用部署脚本
./deploy.sh

# 方法 2：手动部署
npm run build
vercel --prod
```

## 🛠 技术栈

- **前端框架**：Next.js 15 (App Router)
- **UI 组件**：shadcn/ui + Tailwind CSS
- **数据库**：PostgreSQL (Supabase)
- **ORM**：Prisma
- **动画**：Framer Motion
- **数学公式**：KaTeX
- **认证**：Cookie-based Session

## 📂 项目结构

```
rail-to-bachelor/
├── src/
│   ├── app/              # Next.js 页面和 API 路由
│   │   ├── api/          # API 端点
│   │   ├── papers/       # 试卷相关页面
│   │   ├── mistakes/     # 错题集页面
│   │   ├── records/      # 答题记录页面
│   │   └── page.tsx      # 主页
│   ├── components/       # 可复用组件
│   │   └── ui/           # UI 组件库
│   ├── features/         # 功能模块
│   │   └── gamification/ # 游戏化功能
│   └── lib/              # 工具函数
│       ├── auth.ts       # 认证相关
│       └── db/           # 数据库配置
├── prisma/
│   └── schema.prisma     # 数据库模型
├── scripts/              # 脚本文件
└── public/               # 静态资源
```

## 👥 用户角色

### 普通用户
- 答题练习
- 查看答题记录
- 查看错题集
- 查看解析

### 管理员
- 所有普通用户功能
- 编辑题目
- 删除题目
- 导入题目
- 管理试卷

## 🎯 默认账号

### 管理员
- 用户名：`admin`
- 密码：`admin123`

### 普通用户
- 用户名：`yuxin`
- 密码：`yuxin`

**⚠️ 部署后请立即修改默认密码！**

## 📊 数据库模型

- **User**：用户信息
- **Question**：题目
- **ExamPaper**：试卷
- **ExamRecord**：答题记录
- **StudyRecord**：学习记录（错题）
- **Tag**：题目标签

## 🔧 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# Node 环境
NODE_ENV="development"
```

## 📝 开发指南

### 添加新功能

1. 在 `src/app` 中创建新页面
2. 在 `src/app/api` 中创建 API 路由
3. 更新 Prisma schema（如需要）
4. 运行数据库迁移

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 组件使用函数式写法
- API 路由使用 RESTful 风格

## 🐛 常见问题

### 1. 数据库连接失败
检查 `.env` 文件中的 `DATABASE_URL` 是否正确

### 2. 构建失败
```bash
# 清除缓存
rm -rf .next
npm run build
```

### 3. Prisma 错误
```bash
# 重新生成 Prisma Client
npx prisma generate
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请提交 Issue。

---

**祝你考试顺利！加油！💪**
