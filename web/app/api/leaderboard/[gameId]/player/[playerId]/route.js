import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { gameId, playerId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';

    const playerEntry = await prisma.leaderboard.findUnique({
      where: {
        gameId_playerId_period: {
          gameId,
          playerId,
          period,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            username: true,
            level: true,
            rank: true,
          },
        },
      },
    });

    if (!playerEntry) {
      return NextResponse.json({
        success: false,
        error: 'Player not found in leaderboard',
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: playerEntry });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
