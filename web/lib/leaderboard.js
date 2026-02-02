import { prisma } from '@/lib/prisma';

export async function updateLeaderboard(gameId, playerId, score) {
  const existing = await prisma.leaderboard.findUnique({
    where: {
      gameId_playerId_period: {
        gameId,
        playerId,
        period: 'all-time',
      },
    },
  });

  if (!existing || score > existing.score) {
    await prisma.leaderboard.upsert({
      where: {
        gameId_playerId_period: {
          gameId,
          playerId,
          period: 'all-time',
        },
      },
      update: { score },
      create: {
        gameId,
        playerId,
        score,
        rank: 0, // Will be recalculated
        period: 'all-time',
      },
    });

    // Recalculate ranks
    const allScores = await prisma.leaderboard.findMany({
      where: { gameId, period: 'all-time' },
      orderBy: { score: 'desc' },
    });

    for (let i = 0; i < allScores.length; i++) {
        // Optimization: only update if rank changed
        if (allScores[i].rank !== i + 1) {
            await prisma.leaderboard.update({
                where: { id: allScores[i].id },
                data: { rank: i + 1 },
            });
        }
    }
  }
}
