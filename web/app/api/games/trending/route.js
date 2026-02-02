import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { GAMES } from '../../../../lib/constants';

export async function GET() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const previous24Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const trendingGames = await Promise.all(
      GAMES.map(async (game) => {
        // Get unique players in last 24 hours
        const recentPlayers = await prisma.match.findMany({
          where: {
            gameId: game.id,
            createdAt: { gte: last24Hours }
          },
          distinct: ['playerId'],
          select: { playerId: true }
        });

        // Get unique players in previous 24 hours (for comparison)
        const previousPlayers = await prisma.match.findMany({
          where: {
            gameId: game.id,
            createdAt: {
              gte: previous24Hours,
              lt: last24Hours
            }
          },
          distinct: ['playerId'],
          select: { playerId: true }
        });

        const currentCount = recentPlayers.length;
        const previousCount = previousPlayers.length;

        // Calculate percentage change
        let changePercent = 0;
        if (previousCount > 0) {
          changePercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
        } else if (currentCount > 0) {
          changePercent = 100; // New activity
        }

        return {
          id: game.id,
          title: game.title,
          icon: game.icon,
          thumbnail: game.thumbnail,
          players: currentCount,
          change: changePercent,
          changeFormatted: `${changePercent >= 0 ? '+' : ''}${changePercent}%`
        };
      })
    );

    // Sort by player count (descending)
    const sorted = trendingGames
      .sort((a, b) => b.players - a.players)
      .map((game, index) => ({
        ...game,
        rank: index + 1
      }));

    return NextResponse.json({ success: true, trending: sorted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
