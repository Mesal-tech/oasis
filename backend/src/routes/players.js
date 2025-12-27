const express = require('express');
const router = express.Router();
const prisma = require('../db');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Register or get player
router.post('/register', async (req, res, next) => {
  try {
    const { walletAddress, username, email } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
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
      return res.json({ success: true, player, isNew: false });
    }

    // Create new player
    player = await prisma.player.create({
      data: {
        username,
        walletAddress,
        email,
      },
    });

    logger.info('New player registered', { playerId: player.id, username });

    res.status(201).json({ success: true, player, isNew: true });
  } catch (error) {
    next(error);
  }
});

// Get player profile
router.get('/:id', async (req, res, next) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        matches: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        leaderboards: true,
      },
    });

    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    res.json({ success: true, player });
  } catch (error) {
    next(error);
  }
});

// Update player profile
router.put('/:id', async (req, res, next) => {
  try {
    const { username, email } = req.body;

    const player = await prisma.player.update({
      where: { id: req.params.id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
      },
    });

    res.json({ success: true, player });
  } catch (error) {
    next(error);
  }
});

// Get player stats
router.get('/:id/stats', async (req, res, next) => {
  try {
    const playerId = req.params.id;

    const [player, matchCount, totalXP, totalTokens, recentMatches] = await Promise.all([
      prisma.player.findUnique({ where: { id: playerId } }),
      prisma.match.count({ where: { playerId } }),
      prisma.match.aggregate({
        where: { playerId },
        _sum: { earnedXP: true },
      }),
      prisma.match.aggregate({
        where: { playerId },
        _sum: { earnedTokens: true },
      }),
      prisma.match.findMany({
        where: { playerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    res.json({
      success: true,
      stats: {
        player,
        matchCount,
        totalXP: totalXP._sum.earnedXP || 0,
        totalTokens: totalTokens._sum.earnedTokens || 0,
        recentMatches,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Add XP to player
router.post('/:id/xp', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const playerId = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid XP amount' });
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const newXP = player.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1; // Simple level calculation

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    res.json({ success: true, player: updatedPlayer });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
