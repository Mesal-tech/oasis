import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { GAMES } from '../../../lib/constants';

// Cache configuration
const CACHE_DURATION = 60; // 60 seconds

export async function GET() {
  try {
    const gamesWithStats = await Promise.all(
      GAMES.map(async (game) => {
        const playerCount = await prisma.match.findMany({
          where: { gameId: game.id },
          distinct: ['playerId'],
        });

        return {
          ...game,
          players: playerCount.length,
        };
      })
    );

    return NextResponse.json(
      { success: true, games: gamesWithStats },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    );
  } catch (error) {
    console.error('[API /api/games] Error:', error);
    console.error('[API /api/games] Error message:', error.message);
    console.error('[API /api/games] Error stack:', error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
