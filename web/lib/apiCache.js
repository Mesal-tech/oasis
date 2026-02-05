// Simple in-memory cache for API responses
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, data, ttl = 60000) {
    // ttl in milliseconds, default 60 seconds
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      // Cache expired or doesn't exist
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    } else {
      this.cache.clear();
      this.timestamps.clear();
    }
  }

  has(key) {
    const timestamp = this.timestamps.get(key);
    return timestamp && Date.now() <= timestamp;
  }
}

// Create singleton instance
const apiCache = new APICache();

// Cached fetch wrapper
export async function cachedFetch(url, options = {}, ttl = 60000) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${url}`);
    return cached;
  }

  console.log(`[Cache MISS] ${url}`);
  
  // Fetch fresh data
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Cache successful responses
    if (response.ok) {
      apiCache.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    console.error(`[Cache ERROR] ${url}:`, error);
    throw error;
  }
}

// Export cache instance for manual control
export { apiCache };
