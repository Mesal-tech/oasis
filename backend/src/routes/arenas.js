const express = require('express');
const router = express.Router();
const prisma = require('../db');
const logger = require('../utils/logger');

// Create arena
router.post('/', async (req, res, next) => {
  try {
    const { gameId, name, entryFee, maxPlayers } = req.body;

    if (!gameId || !name) {
      return res.status(400).json({
        success: false,
        error: 'gameId and name are required',
      });
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

    res.status(201).json({ success: true, arena });
  } catch (error) {
    next(error);
  }
});

// Get all arenas
router.get('/', async (req, res, next) => {
  try {
    const { gameId, status } = req.query;

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

    res.json({ success: true, arenas });
  } catch (error) {
    next(error);
  }
});

// Get arena details
router.get('/:id', async (req, res, next) => {
  try {
    const arena = await prisma.arena.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ success: false, error: 'Arena not found' });
    }

    res.json({ success: true, arena });
  } catch (error) {
    next(error);
  }
});

// Join arena
router.post('/:id/join', async (req, res, next) => {
  try {
    const { playerId } = req.body;
    const arenaId = req.params.id;

    if (!playerId) {
      return res.status(400).json({ success: false, error: 'playerId is required' });
    }

    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: { players: true },
    });

    if (!arena) {
      return res.status(404).json({ success: false, error: 'Arena not found' });
    }

    if (arena.status !== 'WAITING') {
      return res.status(400).json({ success: false, error: 'Arena is not accepting players' });
    }

    if (arena.players.length >= arena.maxPlayers) {
      return res.status(400).json({ success: false, error: 'Arena is full' });
    }

    // Check if player already joined
    const existingPlayer = arena.players.find((p) => p.playerId === playerId);
    if (existingPlayer) {
      return res.status(400).json({ success: false, error: 'Player already in arena' });
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

    res.json({ success: true, arenaPlayer });
  } catch (error) {
    next(error);
  }
});

// Complete arena with results
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { results } = req.body; // Array of { playerId, score }
    const arenaId = req.params.id;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ success: false, error: 'results array is required' });
    }

    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
    });

    if (!arena) {
      return res.status(404).json({ success: false, error: 'Arena not found' });
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

    res.json({ success: true, winnerId, prizePool: arena.prizePool });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
