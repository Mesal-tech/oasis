import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with optimized connection pool settings
const connectionUrl = process.env.DATABASE_URL;

// Add connection limit parameters only in production
// In development, we need more connections for Fast Refresh and concurrent API calls
const isProduction = process.env.NODE_ENV === 'production';
const urlWithParams = isProduction && connectionUrl && !connectionUrl.includes('connection_limit')
  ? `${connectionUrl}${connectionUrl.includes('?') ? '&' : '?'}connection_limit=1&pgbouncer=true`
  : connectionUrl;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: urlWithParams,
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
