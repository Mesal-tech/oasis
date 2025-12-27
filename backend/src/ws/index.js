const SlitherServer = require('./slither/SlitherServer');
const FlappyServer = require('./flappy/FlappyServer');
const logger = require('../utils/logger');

function initializeGameServers(io) {
  logger.info('Initializing game servers...');

  // Initialize game servers
  const slitherServer = new SlitherServer(io);
  const flappyServer = new FlappyServer(io);

  logger.info('All game servers initialized successfully');

  return {
    slitherServer,
    flappyServer,
  };
}

module.exports = initializeGameServers;
