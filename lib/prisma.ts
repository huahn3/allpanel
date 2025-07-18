import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 确保数据库路径正确
const getDatabaseUrl = () => {
  // 如果有环境变量，使用环境变量
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // 否则根据环境构建路径
  const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/prisma/dev.db'  // 容器环境
    : path.join(process.cwd(), 'prisma', 'dev.db')  // 开发环境

  return `file:${dbPath}`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
