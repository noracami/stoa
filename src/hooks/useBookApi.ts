import { useState, useEffect, useCallback } from 'react';
import type { Book, BookMetadata, BookWithMetadata } from '../lib/types';
import { fetchBookMetadata } from '../lib/googleBooks';
import { useLocalCache } from './useLocalCache';

/** 並行請求數量限制 */
const CONCURRENCY = 5;

/**
 * 書籍 API Hook - 管理書籍元資料的載入
 */
export function useBookApi(books: Book[]) {
  const [metadataMap, setMetadataMap] = useState<Map<string, BookMetadata | null>>(new Map());
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());
  const { getCachedMetadata, setCachedMetadata } = useLocalCache();

  // 載入書籍元資料
  useEffect(() => {
    const loadMetadata = async () => {
      // 找出需要載入的 ISBN
      const isbnsToLoad = books
        .map((b) => b.isbn)
        .filter((isbn) => !metadataMap.has(isbn) && !loadingSet.has(isbn));

      if (isbnsToLoad.length === 0) {
        return;
      }

      // 先檢查快取
      const uncachedIsbns: string[] = [];

      for (const isbn of isbnsToLoad) {
        const cached = getCachedMetadata(isbn);

        if (cached) {
          setMetadataMap((prev) => new Map(prev).set(isbn, cached));
        } else {
          uncachedIsbns.push(isbn);
        }
      }

      if (uncachedIsbns.length === 0) {
        return;
      }

      // 標記為載入中
      setLoadingSet((prev) => {
        const next = new Set(prev);
        uncachedIsbns.forEach((isbn) => next.add(isbn));
        return next;
      });

      // 分批載入
      for (let i = 0; i < uncachedIsbns.length; i += CONCURRENCY) {
        const batch = uncachedIsbns.slice(i, i + CONCURRENCY);

        const results = await Promise.all(
          batch.map(async (isbn) => {
            const metadata = await fetchBookMetadata(isbn);
            return { isbn, metadata };
          })
        );

        // 更新狀態和快取
        setMetadataMap((prev) => {
          const next = new Map(prev);
          for (const { isbn, metadata } of results) {
            next.set(isbn, metadata);
            if (metadata) {
              setCachedMetadata(isbn, metadata);
            }
          }
          return next;
        });

        setLoadingSet((prev) => {
          const next = new Set(prev);
          batch.forEach((isbn) => next.delete(isbn));
          return next;
        });
      }
    };

    loadMetadata();
  }, [books, getCachedMetadata, setCachedMetadata, metadataMap, loadingSet]);

  /**
   * 重新載入指定書籍的元資料
   */
  const reloadMetadata = useCallback(
    async (isbn: string) => {
      setLoadingSet((prev) => new Set(prev).add(isbn));

      const metadata = await fetchBookMetadata(isbn);

      setMetadataMap((prev) => new Map(prev).set(isbn, metadata));

      if (metadata) {
        setCachedMetadata(isbn, metadata);
      }

      setLoadingSet((prev) => {
        const next = new Set(prev);
        next.delete(isbn);
        return next;
      });

      return metadata;
    },
    [setCachedMetadata]
  );

  /**
   * 取得書籍完整資訊（含元資料）
   */
  const getBooksWithMetadata = useCallback((): BookWithMetadata[] => {
    return books.map((book) => ({
      ...book,
      metadata: metadataMap.get(book.isbn) ?? null,
      isLoadingMetadata: loadingSet.has(book.isbn),
    }));
  }, [books, metadataMap, loadingSet]);

  /**
   * 取得單本書籍的元資料
   */
  const getMetadata = useCallback(
    (isbn: string): BookMetadata | null => {
      return metadataMap.get(isbn) ?? null;
    },
    [metadataMap]
  );

  /**
   * 檢查是否正在載入
   */
  const isLoading = useCallback(
    (isbn: string): boolean => {
      return loadingSet.has(isbn);
    },
    [loadingSet]
  );

  return {
    booksWithMetadata: getBooksWithMetadata(),
    getMetadata,
    isLoading,
    reloadMetadata,
    isAnyLoading: loadingSet.size > 0,
  };
}
