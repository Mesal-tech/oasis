import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET /api/players/[id]/stats
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [player, matchCount, totalXP, totalTokens, recentMatches] = await Promise.all([
      prisma.player.findUnique({ where: { id } }),
      prisma.match.count({ where: { playerId: id } }),
      prisma.match.aggregate({
        where: { playerId: id },
        _sum: { earnedXP: true },
      }),
      prisma.match.aggregate({
        where: { playerId: id },
        _sum: { earnedTokens: true },
      }),
      prisma.match.findMany({
        where: { playerId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        player,
        matchCount,
        totalXP: totalXP._sum.earnedXP || 0,
        totalTokens: totalTokens._sum.earnedTokens || 0,
        recentMatches,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
