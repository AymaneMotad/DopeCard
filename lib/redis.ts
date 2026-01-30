/**
 * Redis Helper (Upstash Redis)
 * 
 * Optional: Used for caching frequently accessed data
 * This is separate from QStash (which is for message queuing)
 */

import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Redis credentials not configured. Caching will be disabled.');
}

export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Set a value in cache with optional TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!redis) {
      console.warn('Redis not configured, skipping cache set');
      return;
    }

    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  },

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get<string>(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  },

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  },

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis cache exists error:', error);
      return false;
    }
  },
};


