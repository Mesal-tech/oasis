import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with optimized connection pool settings
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // Connection pool configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Prevent multiple instances during hot-reload in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
