import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { GAMES } from '../../../../lib/constants';

export async function GET(request, { params }) {
  try {
    const { gameId } = await params;
    const game = GAMES.find((g) => g.id === gameId);

    if (!game) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    // Get game statistics
    const [matchCount, topScores, recentMatches] = await Promise.all([
      prisma.match.count({ where: { gameId } }),
      prisma.match.findMany({
        where: { gameId },
        orderBy: { score: 'desc' },
        take: 10,
        include: { player: true },
      }),
      prisma.match.findMany({
        where: { gameId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { player: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      game: {
        ...game,
        stats: {
          matchCount,
          topScores,
          recentMatches,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
