const express = require('express');
const router = express.Router();
const prisma = require('../db');
const logger = require('../utils/logger');

// Game metadata (5 games total)
const GAMES = [
  {
    id: 'slither',
    title: 'Slither.io',
    icon: '🐍',
    description: 'Grow your snake and compete online',
    category: 'multiplayer',
    earnRate: '2x',
    thumbnail: '/assets/slither-thumb.jpg',
  },
  {
    id: 'flappy',
    title: 'Flappy Bird',
    icon: '🦅',
    description: 'Navigate through pipes and earn rewards',
    category: 'arcade',
    earnRate: '1.5x',
    thumbnail: '/assets/flappy-thumb.jpg',
  },
  {
    id: 'cards',
    title: 'Cards',
    icon: '🃏',
    description: 'Play classic card games online',
    category: 'multiplayer',
    earnRate: '1.2x',
    thumbnail: '/assets/cards-thumb.png',
  },
  {
    id: 'checkers',
    title: 'Checkers',
    icon: '🔴',
    description: 'Classic strategy board game',
    category: 'board',
    earnRate: '1x',
    thumbnail: '/assets/checkers-thumb.jpg',
  },
  {
    id: 'whot',
    title: 'Naija Whot',
    icon: '🃏',
    description: 'Play the classic Nigerian card game',
    category: 'cards',
    earnRate: '1.5x',
    thumbnail: '/assets/whot-thumb.jpg',
  },
];

// Get all games
router.get('/', async (req, res, next) => {
  try {
    // Enhance with player counts from matches
    const gamesWithStats = await Promise.all(
      GAMES.map(async (game) => {
        const playerCount = await prisma.match.findMany({
          where: { gameId: game.id },
          distinct: ['playerId'],
        });

        return {
          ...game,
          players: playerCount.length,
        };
      })
    );

    res.json({ success: true, games: gamesWithStats });
  } catch (error) {
    next(error);
  }
});

// Get trending games (sorted by recent activity and growth)
router.get('/trending', async (req, res, next) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const previous24Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const trendingGames = await Promise.all(
      GAMES.map(async (game) => {
        // Get unique players in last 24 hours
        const recentPlayers = await prisma.match.findMany({
          where: {
            gameId: game.id,
            createdAt: { gte: last24Hours }
          },
          distinct: ['playerId'],
          select: { playerId: true }
        });

        // Get unique players in previous 24 hours (for comparison)
        const previousPlayers = await prisma.match.findMany({
          where: {
            gameId: game.id,
            createdAt: {
              gte: previous24Hours,
              lt: last24Hours
            }
          },
          distinct: ['playerId'],
          select: { playerId: true }
        });

        const currentCount = recentPlayers.length;
        const previousCount = previousPlayers.length;

        // Calculate percentage change
        let changePercent = 0;
        if (previousCount > 0) {
          changePercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
        } else if (currentCount > 0) {
          changePercent = 100; // New activity
        }

        return {
          id: game.id,
          title: game.title,
          icon: game.icon,
          thumbnail: game.thumbnail,
          players: currentCount,
          change: changePercent,
          changeFormatted: `${changePercent >= 0 ? '+' : ''}${changePercent}%`
        };
      })
    );

    // Sort by player count (descending)
    const sorted = trendingGames
      .sort((a, b) => b.players - a.players)
      .map((game, index) => ({
        ...game,
        rank: index + 1
      }));

    res.json({ success: true, trending: sorted });
  } catch (error) {
    next(error);
  }
});

// Get game details
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const game = GAMES.find((g) => g.id === gameId);

    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    // Get game statistics
    const [matchCount, topScores, recentMatches] = await Promise.all([
      prisma.match.count({ where: { gameId } }),
      prisma.match.findMany({
        where: { gameId },
        orderBy: { score: 'desc' },
        take: 10,
        include: { player: true },
      }),
      prisma.match.findMany({
        where: { gameId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { player: true },
      }),
    ]);

    res.json({
      success: true,
      game: {
        ...game,
        stats: {
          matchCount,
          topScores,
          recentMatches,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user stats for a specific game
router.get('/:gameId/my-stats', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    // Assuming auth middleware populates req.player or req.user
    // If not, we might need to check how auth is handled.
    // For now, let's try to get it from request property set by auth middleware.
    // Ideally update this after checking server.js
    const playerId = req.player?.id || req.user?.id || req.query.playerId;

    if (!playerId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
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

    res.json({
      success: true,
      stats: {
        highScore: highScore?.score || 0,
        lastScore: lastMatch?.score || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Record match result
router.post('/:gameId/match', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { playerId, score, duration, metadata } = req.body;

    if (!playerId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'playerId and score are required',
      });
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

    res.status(201).json({
      success: true,
      match,
      earnedXP,
      earnedTokens,
      message: rewardReason
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(gameId, playerId, score) {
  const existing = await prisma.leaderboard.findUnique({
    where: {
      gameId_playerId_period: {
        gameId,
        playerId,
        period: 'all-time',
      },
    },
  });

  if (!existing || score > existing.score) {
    await prisma.leaderboard.upsert({
      where: {
        gameId_playerId_period: {
          gameId,
          playerId,
          period: 'all-time',
        },
      },
      update: { score },
      create: {
        gameId,
        playerId,
        score,
        rank: 0, // Will be recalculated
        period: 'all-time',
      },
    });

    // Recalculate ranks
    const allScores = await prisma.leaderboard.findMany({
      where: { gameId, period: 'all-time' },
      orderBy: { score: 'desc' },
    });

    for (let i = 0; i < allScores.length; i++) {
      await prisma.leaderboard.update({
        where: { id: allScores[i].id },
        data: { rank: i + 1 },
      });
    }
  }
}

module.exports = router;
