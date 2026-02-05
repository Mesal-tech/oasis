import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/players/[id] - Get player profile
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        matches: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        leaderboards: true,
      },
    });

    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, player });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/players/[id] - Update player profile
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { username, email } = await request.json();

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
      },
    });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
