const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample players
  const player1 = await prisma.player.upsert({
    where: { username: 'Sal' },
    update: {},
    create: {
      username: 'Sal',
      walletAddress: '0xabcd...sal',
      level: 42,
      xp: 92000,
      rank: 'Bronze',
      balance: 10,
      tokens: 9234,
    },
  });

  const player2 = await prisma.player.upsert({
    where: { username: 'Alice' },
    update: {},
    create: {
      username: 'Alice',
      walletAddress: '0x1234...alice',
      level: 35,
      xp: 75000,
      rank: 'Silver',
      balance: 25,
      tokens: 15000,
    },
  });

  const player3 = await prisma.player.upsert({
    where: { username: 'Bob' },
    update: {},
    create: {
      username: 'Bob',
      walletAddress: '0x5678...bob',
      level: 28,
      xp: 58000,
      rank: 'Bronze',
      balance: 15,
      tokens: 8500,
    },
  });

  console.log('Created players:', { player1, player2, player3 });

  // Create sample matches
  await prisma.match.createMany({
    data: [
      {
        gameId: 'slither',
        playerId: player1.id,
        score: 15420,
        duration: 320,
        earnedXP: 150,
        earnedTokens: 50,
      },
      {
        gameId: 'flappy',
        playerId: player1.id,
        score: 42,
        duration: 180,
        earnedXP: 80,
        earnedTokens: 25,
      },
      {
        gameId: 'slither',
        playerId: player2.id,
        score: 18900,
        duration: 420,
        earnedXP: 200,
        earnedTokens: 75,
      },
    ],
  });

  // Create leaderboard entries
  await prisma.leaderboard.createMany({
    data: [
      {
        gameId: 'slither',
        playerId: player2.id,
        score: 18900,
        rank: 1,
        period: 'all-time',
      },
      {
        gameId: 'slither',
        playerId: player1.id,
        score: 15420,
        rank: 2,
        period: 'all-time',
      },
      {
        gameId: 'slither',
        playerId: player3.id,
        score: 12300,
        rank: 3,
        period: 'all-time',
      },
      {
        gameId: 'flappy',
        playerId: player1.id,
        score: 42,
        rank: 1,
        period: 'all-time',
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
