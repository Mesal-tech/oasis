const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} catch (error) {
  console.warn('⚠️  Prisma client not initialized. Database not configured yet.');
  console.warn('   Run "npm run db:push" after setting up Supabase to enable database features.');
  // Create a mock prisma client that returns empty results
  prisma = {
    player: { findUnique: async () => null, findMany: async () => [], create: async () => null, update: async () => null },
    match: { findMany: async () => [], create: async () => null, count: async () => 0, aggregate: async () => ({ _sum: {} }) },
    arena: { findMany: async () => [], findUnique: async () => null, create: async () => null, update: async () => null },
    arenaPlayer: { create: async () => null, updateMany: async () => null },
    leaderboard: { findMany: async () => [], findUnique: async () => null, upsert: async () => null, update: async () => null },
  };
}

module.exports = prisma;
