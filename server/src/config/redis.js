const Redis = require('ioredis');
const config = require('./environment');

// Resilient In-Memory Fallback Cache when Redis service is not active
class MemoryCache {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    // Auto-cleanup timer every 30s
    this.cleanupTimer = setInterval(() => this.cleanup(), 30000);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttls.entries()) {
      if (expiry <= now) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }

  async get(key) {
    const expiry = this.ttls.get(key);
    if (expiry && expiry <= Date.now()) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    const val = this.store.get(key);
    return val !== undefined ? String(val) : null;
  }

  async set(key, value) {
    this.store.set(key, String(value));
    this.ttls.delete(key);
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.store.set(key, String(value));
    this.ttls.set(key, Date.now() + seconds * 1000);
    return 'OK';
  }

  async del(key) {
    const existed = this.store.delete(key);
    this.ttls.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key) {
    const current = parseInt(await this.get(key) || '0', 10);
    const next = current + 1;
    this.store.set(key, String(next));
    return next;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.ttls.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async ttl(key) {
    const expiry = this.ttls.get(key);
    if (!expiry) return this.store.has(key) ? -1 : -2;
    const remaining = Math.ceil((expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async quit() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.store.clear();
    this.ttls.clear();
  }
}

const memoryCache = new MemoryCache();
let redisClient = null;
let isRedisAvailable = false;
let loggedFallbackNotice = false;

try {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        if (!loggedFallbackNotice) {
          console.warn('[Redis] Connection unreachable. Switching gracefully to in-memory fallback cache.');
          console.info('[Redis Tip] To run Redis locally, use: docker run -d -p 6379:6379 redis:alpine');
          loggedFallbackNotice = true;
        }
        return null; // Stop reconnecting in loop to prevent log noise
      }
      return Math.min(times * 200, 2000);
    },
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Redis] Connected successfully to Redis server.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    if (!loggedFallbackNotice) {
      console.warn(`[Redis Notice] Connection notice: ${err.message}. Using safe in-memory cache.`);
      loggedFallbackNotice = true;
    }
  });

  // Attempt initial connect
  redisClient.connect().catch((err) => {
    isRedisAvailable = false;
    if (!loggedFallbackNotice) {
      console.warn(`[Redis Notice] Server not detected on ${config.redisUrl}. Using in-memory store.`);
      loggedFallbackNotice = true;
    }
  });
} catch (e) {
  isRedisAvailable = false;
}

// Unified Cache Proxy that prefers Redis when available and falls back safely
const cacheClient = {
  isRedisConnected: () => isRedisAvailable,

  async get(key) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.get(key);
      } catch {
        return await memoryCache.get(key);
      }
    }
    return await memoryCache.get(key);
  },

  async set(key, value) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.set(key, value);
      } catch {
        return await memoryCache.set(key, value);
      }
    }
    return await memoryCache.set(key, value);
  },

  async setex(key, seconds, value) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.setex(key, seconds, value);
      } catch {
        return await memoryCache.setex(key, seconds, value);
      }
    }
    return await memoryCache.setex(key, seconds, value);
  },

  async del(key) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.del(key);
      } catch {
        return await memoryCache.del(key);
      }
    }
    return await memoryCache.del(key);
  },

  async incr(key) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.incr(key);
      } catch {
        return await memoryCache.incr(key);
      }
    }
    return await memoryCache.incr(key);
  },

  async expire(key, seconds) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.expire(key, seconds);
      } catch {
        return await memoryCache.expire(key, seconds);
      }
    }
    return await memoryCache.expire(key, seconds);
  },

  async ttl(key) {
    if (isRedisAvailable && redisClient?.status === 'ready') {
      try {
        return await redisClient.ttl(key);
      } catch {
        return await memoryCache.ttl(key);
      }
    }
    return await memoryCache.ttl(key);
  },

  async quit() {
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {}
    }
    await memoryCache.quit();
  },
};

module.exports = cacheClient;
