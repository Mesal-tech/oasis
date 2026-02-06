import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with optimized connection pool settings
const connectionUrl = process.env.DATABASE_URL;

// Adjust connection pool based on environment
// Development needs more connections due to concurrent API calls and Fast Refresh
// Production keeps lower limit to avoid Supabase pooler limits
const isProduction = process.env.NODE_ENV === 'production';

// Remove existing connection params and add appropriate ones for environment
let urlWithParams = connectionUrl;
if (connectionUrl) {
  // Strip existing connection_limit if present to avoid duplicates
  const baseUrl = connectionUrl.replace(/[?&]connection_limit=\d+/g, '').replace(/[?&]pgbouncer=true/g, '');
  const separator = baseUrl.includes('?') ? '&' : '?';
  const connectionLimit = isProduction ? 1 : 5;
  const poolTimeout = isProduction ? 10 : 30;
  urlWithParams = `${baseUrl}${separator}connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}&pgbouncer=true`;
}

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
