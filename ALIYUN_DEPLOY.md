
# ☁️ 阿里云服务器部署指南

恭喜你有了自己的服务器！下面是基于 Docker 的最简单部署方案。

## 1. 准备工作

### 本地准备（在你的电脑上）

1. **修改 `docker-compose.yml`**
   - 打开项目根目录下的 `docker-compose.yml`
   - 修改 `POSTGRES_PASSWORD` 和 `DATABASE_URL` 里的密码（建议改得复杂一点）

2. **提交代码到 Git 仓库**（如果你还没做）
   你需要把代码上传到 GitHub/Gitee，或者直接打包上传到服务器。推荐使用 Git。
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

## 2. 连接服务器

使用终端连接你的阿里云服务器：

```bash
# 替换为你的服务器公网 IP
ssh root@your_server_ip
```

## 3. 服务器环境安装

在服务器终端执行以下命令安装 Docker：

```bash
# 更新系统
apt-get update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose (新版 Docker 已内置，可跳过此步，直接用 docker compose)
```

## 4. 部署项目

### 方式 A：通过 Git 拉取（推荐）

```bash
# 1. 拉取代码
git clone https://github.com/你的用户名/rail-to-bachelor.git
cd rail-to-bachelor

# 2. 启动服务
docker compose up -d --build
```

### 方式 B：直接上传文件（如果你不想用 Git）

你可以使用 `scp` 命令把本地项目上传到服务器：

```bash
# 在你本地电脑执行
scp -r /Users/yup/Desktop/yuxin/rail-to-bachelor root@your_server_ip:/root/
```

然后在服务器上：
```bash
cd rail-to-bachelor
docker compose up -d --build
```

## 5. 验证部署

访问：`http://你的服务器IP:3000`

你应该能看到你的项目了！

---

## 6. 配置域名 (Nginx)

为了通过域名访问（去掉 :3000 端口），我们需要安装 Nginx。

1. **安装 Nginx**
   ```bash
   apt-get install -y nginx
   ```

2. **配置 Nginx**
   创建配置文件：
   ```bash
   nano /etc/nginx/sites-available/rail-to-bachelor
   ```

   粘贴以下内容（修改域名）：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com; # 替换成你的域名

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **启用配置并重启**
   ```bash
   ln -s /etc/nginx/sites-available/rail-to-bachelor /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

4. **开启 HTTPS (可选但推荐)**
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

现在你可以通过 `http://your-domain.com` 访问了！
