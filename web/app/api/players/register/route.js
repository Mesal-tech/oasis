import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { walletAddress, username, email } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // Check if player exists
    let player = await prisma.player.findFirst({
      where: {
        OR: [
          { username },
          ...(walletAddress ? [{ walletAddress }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (player) {
      return NextResponse.json({ success: true, player, isNew: false });
    }

    // Create new player
    player = await prisma.player.create({
      data: {
        username,
        walletAddress,
        email,
      },
    });

    return NextResponse.json({ success: true, player, isNew: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
