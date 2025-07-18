# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件并安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma 客户端并构建应用
RUN npx prisma generate
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache sqlite

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# 创建数据目录并设置权限
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 复制启动脚本
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["sh", "-c", "node scripts/init-db.js && exec node server.js"]