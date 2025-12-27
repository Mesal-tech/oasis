const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Get global leaderboard
router.get('/global', async (req, res, next) => {
  try {
    const { period = 'all-time', limit = 100 } = req.query;

    // Get top players by XP
    const topPlayers = await prisma.player.findMany({
      orderBy: { xp: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        rank: true,
      },
    });

    res.json({ success: true, leaderboard: topPlayers });
  } catch (error) {
    next(error);
  }
});

// Get game-specific leaderboard
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { period = 'all-time', limit = 100 } = req.query;

    const leaderboard = await prisma.leaderboard.findMany({
      where: { gameId, period },
      orderBy: { rank: 'asc' },
      take: parseInt(limit),
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

    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
});

// Get player rank in a game
router.get('/:gameId/player/:playerId', async (req, res, next) => {
  try {
    const { gameId, playerId } = req.params;
    const { period = 'all-time' } = req.query;

    const playerEntry = await prisma.leaderboard.findUnique({
      where: {
        gameId_playerId_period: {
          gameId,
          playerId,
          period,
        },
      },
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

    if (!playerEntry) {
      return res.status(404).json({
        success: false,
        error: 'Player not found in leaderboard',
      });
    }

    res.json({ success: true, entry: playerEntry });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
