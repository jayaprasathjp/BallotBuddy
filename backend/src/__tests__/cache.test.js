/**
 * Cache Service Tests
 * Comprehensive unit tests for the in-memory TTL cache service.
 */

const cache = require("../services/cache");

// ─── Setup ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  cache.clear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("Cache Service – set / get", () => {
  it("should store and retrieve a value before TTL expires", () => {
    cache.set("key1", { data: "hello" }, 60000);
    expect(cache.get("key1")).toEqual({ data: "hello" });
  });

  it("should return undefined for a key that was never set", () => {
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("should return undefined immediately for a TTL of 0", () => {
    cache.set("instant-expire", "value", 0);
    expect(cache.get("instant-expire")).toBeUndefined();
  });

  it("should support caching null and falsy values", () => {
    cache.set("null-val", null, 60000);
    cache.set("zero-val", 0, 60000);
    cache.set("false-val", false, 60000);
    expect(cache.get("null-val")).toBeNull();
    expect(cache.get("zero-val")).toBe(0);
    expect(cache.get("false-val")).toBe(false);
  });

  it("should overwrite existing key with new value", () => {
    cache.set("overwrite", "first", 60000);
    cache.set("overwrite", "second", 60000);
    expect(cache.get("overwrite")).toBe("second");
  });

  it("should cache objects, arrays, and primitives", () => {
    cache.set("obj", { a: 1 }, 60000);
    cache.set("arr", [1, 2, 3], 60000);
    cache.set("str", "hello", 60000);
    cache.set("num", 42, 60000);
    expect(cache.get("obj")).toEqual({ a: 1 });
    expect(cache.get("arr")).toEqual([1, 2, 3]);
    expect(cache.get("str")).toBe("hello");
    expect(cache.get("num")).toBe(42);
  });

  it("should use default TTL when ttlMs is not specified", () => {
    cache.set("default-ttl", "value");
    expect(cache.get("default-ttl")).toBe("value");
  });
});

describe("Cache Service – invalidate", () => {
  it("should remove a specific key", () => {
    cache.set("to-remove", "data", 60000);
    cache.invalidate("to-remove");
    expect(cache.get("to-remove")).toBeUndefined();
  });

  it("should not throw when invalidating a non-existent key", () => {
    expect(() => cache.invalidate("ghost-key")).not.toThrow();
  });

  it("should not affect other keys when one is invalidated", () => {
    cache.set("keep", "alive", 60000);
    cache.set("remove", "gone", 60000);
    cache.invalidate("remove");
    expect(cache.get("keep")).toBe("alive");
    expect(cache.get("remove")).toBeUndefined();
  });
});

describe("Cache Service – clear", () => {
  it("should remove all entries", () => {
    cache.set("a", 1, 60000);
    cache.set("b", 2, 60000);
    cache.set("c", 3, 60000);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBeUndefined();
  });

  it("should allow re-use after clearing", () => {
    cache.set("x", "old", 60000);
    cache.clear();
    cache.set("x", "new", 60000);
    expect(cache.get("x")).toBe("new");
  });
});

describe("Cache Service – stats", () => {
  it("should report zero size on an empty cache", () => {
    const s = cache.stats();
    expect(s.size).toBe(0);
    expect(s.maxEntries).toBeGreaterThan(0);
    expect(s.defaultTtlMs).toBeGreaterThan(0);
  });

  it("should report correct size after adding entries", () => {
    cache.set("s1", 1, 60000);
    cache.set("s2", 2, 60000);
    expect(cache.stats().size).toBe(2);
  });

  it("should reflect size decrease after clear", () => {
    cache.set("s1", 1, 60000);
    cache.clear();
    expect(cache.stats().size).toBe(0);
  });

  it("should reflect size after invalidation", () => {
    cache.set("a", 1, 60000);
    cache.set("b", 2, 60000);
    cache.invalidate("a");
    expect(cache.stats().size).toBe(1);
  });
});

describe("Cache Service – makeKey", () => {
  it("should generate a consistent key from same parts", () => {
    const k1 = cache.makeKey("chat", "Hello World", "en");
    const k2 = cache.makeKey("chat", "Hello World", "en");
    expect(k1).toBe(k2);
  });

  it("should normalize case and trim whitespace", () => {
    const k1 = cache.makeKey("chat", "  Hello  ", "EN");
    const k2 = cache.makeKey("chat", "Hello", "en");
    expect(k1).toBe(k2);
  });

  it("should distinguish keys by prefix", () => {
    const k1 = cache.makeKey("chat", "query");
    const k2 = cache.makeKey("compare", "query");
    expect(k1).not.toBe(k2);
  });

  it("should distinguish keys with different trailing parts", () => {
    const k1 = cache.makeKey("chat", "vote", "en");
    const k2 = cache.makeKey("chat", "vote", "hi");
    expect(k1).not.toBe(k2);
  });

  it("should handle numeric and boolean parts", () => {
    const k1 = cache.makeKey("test", 123, true);
    expect(typeof k1).toBe("string");
    expect(k1.length).toBeGreaterThan(0);
  });
});
