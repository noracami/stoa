import { useState, useEffect, useCallback } from 'react';
import type { Book, CapacityInfo } from '../lib/types';
import { readFromHash, writeToHash, getCapacityInfo } from '../lib/codec';

/**
 * URL 狀態同步 Hook
 */
export function useUrlState() {
  const [books, setBooks] = useState<Book[]>([]);
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo>({
    currentBytes: 0,
    maxBytes: 2000,
    percentage: 0,
    isNearLimit: false,
    isAtLimit: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化：從 URL hash 讀取書籍
  useEffect(() => {
    const initialBooks = readFromHash();
    setBooks(initialBooks);
    setCapacityInfo(getCapacityInfo(initialBooks));
    setIsInitialized(true);
  }, []);

  // 監聽 hashchange 事件（支援瀏覽器返回）
  useEffect(() => {
    const handleHashChange = () => {
      const newBooks = readFromHash();
      setBooks(newBooks);
      setCapacityInfo(getCapacityInfo(newBooks));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  /**
   * 更新書籍列表並同步到 URL
   */
  const updateBooks = useCallback((newBooks: Book[]) => {
    setBooks(newBooks);
    writeToHash(newBooks);
    setCapacityInfo(getCapacityInfo(newBooks));
  }, []);

  /**
   * 新增書籍
   */
  const addBook = useCallback(
    (book: Omit<Book, 'addedDate'> & { addedDate?: string }) => {
      const newBook: Book = {
        ...book,
        addedDate: book.addedDate || new Date().toISOString().split('T')[0],
      };

      // 檢查是否已存在相同 ISBN
      if (books.some((b) => b.isbn === newBook.isbn)) {
        return { success: false, error: 'duplicate' as const };
      }

      // 檢查容量
      const newBooks = [...books, newBook];
      const newCapacity = getCapacityInfo(newBooks);

      if (newCapacity.isAtLimit) {
        return { success: false, error: 'capacity' as const };
      }

      updateBooks(newBooks);
      return { success: true, book: newBook };
    },
    [books, updateBooks]
  );

  /**
   * 刪除書籍
   */
  const removeBook = useCallback(
    (isbn: string) => {
      const newBooks = books.filter((b) => b.isbn !== isbn);
      updateBooks(newBooks);
    },
    [books, updateBooks]
  );

  /**
   * 切換書籍狀態
   */
  const toggleBookStatus = useCallback(
    (isbn: string) => {
      const newBooks = books.map((book) => {
        if (book.isbn === isbn) {
          return {
            ...book,
            status: book.status === 'available' ? 'borrowed' : 'available',
          } as Book;
        }
        return book;
      });
      updateBooks(newBooks);
    },
    [books, updateBooks]
  );

  /**
   * 取得分享連結
   */
  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.location.href;
  }, []);

  return {
    books,
    capacityInfo,
    isInitialized,
    addBook,
    removeBook,
    toggleBookStatus,
    getShareUrl,
  };
}
