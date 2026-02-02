import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const arena = await prisma.arena.findUnique({
      where: { id },
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
          orderBy: { score: 'desc' },
        },
        winner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!arena) {
      return NextResponse.json({ success: false, error: 'Arena not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, arena });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
