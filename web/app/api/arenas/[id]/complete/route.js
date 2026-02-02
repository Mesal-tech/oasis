import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import logger from '@/utils/logger';

export async function POST(request, { params }) {
  try {
    const { id: arenaId } = await params;
    const body = await request.json();
    const { results } = body; // Array of { playerId, score }

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ success: false, error: 'results array is required' }, { status: 400 });
    }

    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
    });

    if (!arena) {
      return NextResponse.json({ success: false, error: 'Arena not found' }, { status: 404 });
    }

    // Update player scores and ranks
    const sortedResults = results.sort((a, b) => b.score - a.score);

    for (let i = 0; i < sortedResults.length; i++) {
      const { playerId, score } = sortedResults[i];
      await prisma.arenaPlayer.updateMany({
        where: { arenaId, playerId },
        data: {
          score,
          rank: i + 1,
        },
      });
    }

    // Set winner and complete arena
    const winnerId = sortedResults[0]?.playerId;
    await prisma.arena.update({
      where: { id: arenaId },
      data: {
        status: 'COMPLETED',
        winnerId,
        endedAt: new Date(),
      },
    });

    // Award prize to winner
    if (winnerId && arena.prizePool > 0) {
      await prisma.player.update({
        where: { id: winnerId },
        data: {
          balance: {
            increment: arena.prizePool,
          },
        },
      });
    }

    logger.info('Arena completed', { arenaId, winnerId });

    return NextResponse.json({ success: true, winnerId, prizePool: arena.prizePool });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
