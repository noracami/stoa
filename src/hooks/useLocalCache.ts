import { useCallback } from 'react';
import type { BookMetadata, CachedMetadata } from '../lib/types';

/** 快取 key 前綴 */
const CACHE_PREFIX = 'book_meta_';

/** 快取有效期（7 天，單位：毫秒） */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * LocalStorage 快取 Hook
 */
export function useLocalCache() {
  /**
   * 從快取獲取書籍元資料
   */
  const getCachedMetadata = useCallback((isbn: string): BookMetadata | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const key = `${CACHE_PREFIX}${isbn}`;
      const cached = localStorage.getItem(key);

      if (!cached) {
        return null;
      }

      const parsed: CachedMetadata = JSON.parse(cached);

      // 檢查是否過期
      if (Date.now() - parsed.cachedAt > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error(`Failed to read cache for ISBN ${isbn}:`, error);
      return null;
    }
  }, []);

  /**
   * 將書籍元資料存入快取
   */
  const setCachedMetadata = useCallback((isbn: string, data: BookMetadata): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const key = `${CACHE_PREFIX}${isbn}`;
      const cached: CachedMetadata = {
        data,
        cachedAt: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.error(`Failed to write cache for ISBN ${isbn}:`, error);
    }
  }, []);

  /**
   * 清除過期快取
   */
  const clearExpiredCache = useCallback((): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    let cleared = 0;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith(CACHE_PREFIX)) {
          const cached = localStorage.getItem(key);

          if (cached) {
            try {
              const parsed: CachedMetadata = JSON.parse(cached);

              if (Date.now() - parsed.cachedAt > CACHE_TTL) {
                keysToRemove.push(key);
              }
            } catch {
              // 無效的快取資料，也清除
              keysToRemove.push(key);
            }
          }
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
        cleared++;
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }

    return cleared;
  }, []);

  /**
   * 清除所有書籍元資料快取
   */
  const clearAllCache = useCallback((): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    let cleared = 0;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key?.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key);
        cleared++;
      }
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }

    return cleared;
  }, []);

  return {
    getCachedMetadata,
    setCachedMetadata,
    clearExpiredCache,
    clearAllCache,
  };
}
