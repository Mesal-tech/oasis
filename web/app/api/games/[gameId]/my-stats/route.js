import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing playerId' }, { status: 401 });
    }

    const [highScore, lastMatch] = await Promise.all([
      prisma.leaderboard.findUnique({
        where: {
          gameId_playerId_period: {
            gameId,
            playerId,
            period: 'all-time',
          },
        },
      }),
      prisma.match.findFirst({
        where: { gameId, playerId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        highScore: highScore?.score || 0,
        lastScore: lastMatch?.score || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
