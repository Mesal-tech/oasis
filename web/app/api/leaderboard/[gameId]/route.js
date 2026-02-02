import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';
    const limit = parseInt(searchParams.get('limit') || '100');

    const leaderboard = await prisma.leaderboard.findMany({
      where: { gameId, period },
      orderBy: { rank: 'asc' },
      take: limit,
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

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
