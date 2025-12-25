FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install openssl for Prisma and use Aliyun mirror
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 将本地构建好的 standalone 目录复制进去
COPY --chown=nextjs:nodejs .next/standalone ./
# 还需要复制静态资源
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
# 复制 prisma 目录以便运行 migration
COPY --chown=nextjs:nodejs prisma ./prisma

# 在本地安装 Prisma CLI (v5.22.0)，确保 nextjs 用户可以调用且有权限写入
RUN npm install prisma@5.22.0 --save-dev --ignore-scripts

# 修复权限，因为上面的 npm install 是用 root 运行的
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# 直接调用 node_modules 里的 prisma，不走 npx 自动下载逻辑
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --accept-data-loss --skip-generate && node server.js"]