// Simple logger compatible with winston usage in backend code
const logger = {
  info: (msg, meta = {}) => console.log(`[INFO] ${msg}`, meta ? meta : ''),
  error: (msg, meta = {}) => console.error(`[ERROR] ${msg}`, meta ? meta : ''),
  warn: (msg, meta = {}) => console.warn(`[WARN] ${msg}`, meta ? meta : ''),
  debug: (msg, meta = {}) => console.debug(`[DEBUG] ${msg}`, meta ? meta : ''),
};

module.exports = logger;
