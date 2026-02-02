const SlitherServer = require('./slither/SlitherServer');
const FlappyServer = require('./flappy/FlappyServer');
const CheckersServer = require('./checkers/CheckersServer');
const logger = require('../utils/logger');

function initializeGameServers(io) {
  logger.info('Initializing game servers...');

  // Initialize game servers
  const slitherServer = new SlitherServer(io);
  const flappyServer = new FlappyServer(io);
  const checkersServer = new CheckersServer(io);

  logger.info('All game servers initialized successfully');

  return {
    slitherServer,
    flappyServer,
    checkersServer,
  };
}

module.exports = initializeGameServers;
