const Redis = require('ioredis');
require('dotenv').config();

let redis;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redis.on('connect', () => {
    console.log('✓ Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });
} catch (error) {
  console.warn('Redis not available, running without cache:', error.message);
  // Create a mock redis client for development without Redis
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    publish: async () => 0,
    subscribe: async () => { },
    on: () => { },
  };
}

module.exports = redis;
