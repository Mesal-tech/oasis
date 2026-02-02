import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import logger from '@/utils/logger';
import { updateLeaderboard } from '@/lib/leaderboard';

export async function POST(request, { params }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, score, duration, metadata } = body;

    if (!playerId || score === undefined) {
      return NextResponse.json({
        success: false,
        error: 'playerId and score are required',
      }, { status: 400 });
    }

    // Minimum score thresholds (prevent farming)
    const MIN_SCORE_THRESHOLD = {
      'slither': 10,
      'flappy': 1,
      'cards': 10,
      'whot': 5,
      'checkers': 10,
    };

    // Anti-farming: minimum duration (30 seconds)
    const minDuration = 30;
    const actualDuration = duration || 0;

    // Calculate earned XP and tokens based on score
    let earnedXP = 0;
    let earnedTokens = 0;
    let rewardReason = '';

    // Check if player meets minimum requirements
    const minThreshold = MIN_SCORE_THRESHOLD[gameId] || 10;

    if (score < minThreshold) {
      rewardReason = `Score below minimum threshold (${minThreshold})`;
    } else if (actualDuration < minDuration) {
      rewardReason = 'Match duration too short (anti-farming)';
    } else {
      // Progressive XP scaling (rewards higher scores exponentially)
      earnedXP = Math.floor(Math.pow(score / 10, 1.2));
      earnedTokens = Math.floor(score / 50);
      rewardReason = 'Rewards earned';
    }

    // Create match record
    const match = await prisma.match.create({
      data: {
        gameId,
        playerId,
        score,
        duration: actualDuration,
        earnedXP,
        earnedTokens,
        metadata,
      },
    });

    // Update player XP and tokens (only if rewards earned)
    if (earnedXP > 0 || earnedTokens > 0) {
      const player = await prisma.player.findUnique({ where: { id: playerId } });
      if (player) {
        const newXP = player.xp + earnedXP;
        const newLevel = Math.floor(newXP / 1000) + 1;

        await prisma.player.update({
          where: { id: playerId },
          data: {
            xp: newXP,
            level: newLevel,
            tokens: player.tokens + earnedTokens,
          },
        });

        // Update leaderboard
        await updateLeaderboard(gameId, playerId, score);
      }
    }

    logger.info('Match recorded', {
      matchId: match.id,
      gameId,
      playerId,
      score,
      earnedXP,
      earnedTokens,
      reason: rewardReason
    });

    return NextResponse.json({
      success: true,
      match,
      earnedXP,
      earnedTokens,
      message: rewardReason
    }, { status: 201 });
  } catch (error) {
    logger.error('Error recording match:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
