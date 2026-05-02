/**
 * In-Memory Cache Service
 * Provides a lightweight TTL-based caching layer using a Map.
 * Used to cache Vertex AI responses and other expensive computations
 * to improve efficiency and reduce redundant API calls.
 *
 * @module services/cache
 */

const logger = require('./logger');

/**
 * @typedef {Object} CacheEntry
 * @property {*} value - The cached value
 * @property {number} expiresAt - Unix timestamp (ms) when this entry expires
 */

/** @type {Map<string, CacheEntry>} */
const store = new Map();

/** Default TTL for AI responses: 15 minutes */
const DEFAULT_TTL_MS = 15 * 60 * 1000;

/** Maximum cache entries to prevent unbounded memory growth */
const MAX_ENTRIES = 500;

/**
 * Generates a stable cache key from input parameters.
 * Normalizes whitespace and lowercases to improve cache hit rates.
 *
 * @param {string} prefix - Namespace prefix (e.g. 'chat', 'compare')
 * @param {...*} parts - Values to include in the key
 * @returns {string} A normalized cache key string
 */
const makeKey = (prefix, ...parts) =>
  `${prefix}::${parts.map((p) => String(p).trim().toLowerCase()).join('|')}`;

/**
 * Retrieves a cached value by key.
 * Automatically evicts the entry if it has expired.
 *
 * @param {string} key - The cache key
 * @returns {*} The cached value, or `undefined` if not found or expired
 */
const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    logger.debug('Cache expired', { key });
    return undefined;
  }

  logger.debug('Cache hit', { key });
  return entry.value;
};

/**
 * Stores a value in the cache with a given TTL.
 * Evicts the oldest entry if the cache has reached MAX_ENTRIES.
 *
 * @param {string} key - The cache key
 * @param {*} value - The value to cache
 * @param {number} [ttlMs=DEFAULT_TTL_MS] - Time-to-live in milliseconds
 */
const set = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  // Evict oldest entry if at capacity
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    store.delete(oldestKey);
    logger.debug('Cache eviction (capacity)', { evicted: oldestKey });
  }

  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  logger.debug('Cache set', { key, ttlMs });
};

/**
 * Removes a specific entry from the cache.
 * @param {string} key - The cache key to invalidate
 */
const invalidate = (key) => {
  store.delete(key);
};

/**
 * Clears all entries from the cache.
 */
const clear = () => {
  store.clear();
  logger.info('Cache cleared');
};

/**
 * Returns current cache statistics for monitoring.
 * @returns {{ size: number, maxEntries: number, defaultTtlMs: number }}
 */
const stats = () => ({
  size: store.size,
  maxEntries: MAX_ENTRIES,
  defaultTtlMs: DEFAULT_TTL_MS,
});

module.exports = { get, set, invalidate, clear, stats, makeKey };
