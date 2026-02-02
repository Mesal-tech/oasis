import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import logger from '@/utils/logger';

export async function POST(request, { params }) {
  try {
    const { id: arenaId } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ success: false, error: 'playerId is required' }, { status: 400 });
    }

    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: { players: true },
    });

    if (!arena) {
      return NextResponse.json({ success: false, error: 'Arena not found' }, { status: 404 });
    }

    if (arena.status !== 'WAITING') {
      return NextResponse.json({ success: false, error: 'Arena is not accepting players' }, { status: 400 });
    }

    if (arena.players.length >= arena.maxPlayers) {
      return NextResponse.json({ success: false, error: 'Arena is full' }, { status: 400 });
    }

    // Check if player already joined
    const existingPlayer = arena.players.find((p) => p.playerId === playerId);
    if (existingPlayer) {
      return NextResponse.json({ success: false, error: 'Player already in arena' }, { status: 400 });
    }

    // Add player to arena
    const arenaPlayer = await prisma.arenaPlayer.create({
      data: {
        arenaId,
        playerId,
      },
    });

    // Update prize pool
    await prisma.arena.update({
      where: { id: arenaId },
      data: {
        prizePool: arena.prizePool + arena.entryFee,
      },
    });

    logger.info('Player joined arena', { arenaId, playerId });

    return NextResponse.json({ success: true, arenaPlayer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
