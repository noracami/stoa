import LZString from 'lz-string';
import type { Book, BookshelfState, CapacityInfo } from './types';

/** 資料版本號 */
const CURRENT_VERSION = 1;

/** URL 最大建議長度 (bytes) */
const MAX_URL_BYTES = 2000;

/**
 * 將書籍陣列編碼為 URL-safe 字串
 */
export function encode(books: Book[]): string {
  if (books.length === 0) {
    return '';
  }

  const state: BookshelfState = {
    books,
    version: CURRENT_VERSION,
  };

  const json = JSON.stringify(state);
  const compressed = LZString.compressToEncodedURIComponent(json);

  return compressed;
}

/**
 * 從 URL hash 還原書籍陣列
 */
export function decode(hash: string): Book[] {
  if (!hash || hash.trim() === '') {
    return [];
  }

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);

    if (!decompressed) {
      console.warn('Failed to decompress hash');
      return [];
    }

    const state = JSON.parse(decompressed) as BookshelfState;

    // 版本檢查（預留未來遷移用）
    if (state.version !== CURRENT_VERSION) {
      console.warn(`Data version mismatch: expected ${CURRENT_VERSION}, got ${state.version}`);
      // 未來可在此處理版本遷移
    }

    // 驗證資料結構
    if (!Array.isArray(state.books)) {
      console.warn('Invalid data structure: books is not an array');
      return [];
    }

    return state.books.filter(isValidBook);
  } catch (error) {
    console.error('Failed to decode hash:', error);
    return [];
  }
}

/**
 * 驗證書籍資料是否有效
 */
function isValidBook(book: unknown): book is Book {
  if (typeof book !== 'object' || book === null) {
    return false;
  }

  const b = book as Record<string, unknown>;

  return (
    typeof b.isbn === 'string' &&
    b.isbn.length > 0 &&
    (b.format === 'physical' || b.format === 'ebook') &&
    (b.status === 'available' || b.status === 'borrowed') &&
    typeof b.addedDate === 'string'
  );
}

/**
 * 計算 URL 容量資訊
 */
export function getCapacityInfo(books: Book[]): CapacityInfo {
  const encoded = encode(books);
  const currentBytes = new TextEncoder().encode(encoded).length;
  const percentage = (currentBytes / MAX_URL_BYTES) * 100;

  return {
    currentBytes,
    maxBytes: MAX_URL_BYTES,
    percentage,
    isNearLimit: percentage > 75,
    isAtLimit: percentage > 95,
  };
}

/**
 * 從 window.location.hash 讀取書籍資料
 */
export function readFromHash(): Book[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const hash = window.location.hash.slice(1); // 移除開頭的 #
  return decode(hash);
}

/**
 * 將書籍資料寫入 window.location.hash
 */
export function writeToHash(books: Book[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const encoded = encode(books);
  const newHash = encoded ? `#${encoded}` : '';

  // 使用 replaceState 避免產生歷史記錄
  window.history.replaceState(null, '', newHash || window.location.pathname);
}
