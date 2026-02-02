import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const status = searchParams.get('status');

    const arenas = await prisma.arena.findMany({
      where: {
        ...(gameId && { gameId }),
        ...(status && { status }),
      },
      include: {
        players: {
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
        },
        winner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, arenas });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameId, name, entryFee, maxPlayers } = body;

    if (!gameId || !name) {
      return NextResponse.json({
        success: false,
        error: 'gameId and name are required',
      }, { status: 400 });
    }

    const arena = await prisma.arena.create({
      data: {
        gameId,
        name,
        entryFee: entryFee || 0,
        prizePool: 0,
        maxPlayers: maxPlayers || 10,
        status: 'WAITING',
      },
    });

    logger.info('Arena created', { arenaId: arena.id, gameId, name });

    return NextResponse.json({ success: true, arena }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
