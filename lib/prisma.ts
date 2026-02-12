/**
 * Prisma 客户端单例
 * 确保在整个应用中只创建一个 Prisma Client 实例
 */
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client 实例
 * 在开发环境中使用热重载时，避免创建多个连接
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
