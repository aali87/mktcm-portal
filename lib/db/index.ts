import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * Uses singleton pattern to prevent multiple instances in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure DATABASE_URL with connection pooling parameters for Railway
let databaseUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV === 'production' && databaseUrl && !databaseUrl.includes('connection_limit')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl += `${separator}connection_limit=5&pool_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
