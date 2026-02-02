import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get top players by XP
    // Note: 'period' logic for global leaderboards assumes cumulative XP in Player model.
    // If period filtering is needed for XP, we'd need a separate XP history table or similar.
    // For now, mirroring existing logic which ignores period for global XP.
    const topPlayers = await prisma.player.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        rank: true,
      },
    });

    return NextResponse.json({ success: true, leaderboard: topPlayers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
