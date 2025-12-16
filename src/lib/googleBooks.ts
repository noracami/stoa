import type { BookMetadata } from './types';

/** Google Books API 端點 */
const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

/** API 回應結構 */
interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBookItem[];
}

interface GoogleBookItem {
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

/**
 * 從 Google Books API 獲取書籍元資料
 */
export async function fetchBookMetadata(isbn: string): Promise<BookMetadata | null> {
  try {
    const url = `${API_BASE}?q=isbn:${encodeURIComponent(isbn)}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API request failed: ${response.status}`);
      return null;
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`No results found for ISBN: ${isbn}`);
      return null;
    }

    const book = data.items[0];
    const volumeInfo = book.volumeInfo;

    // 處理封面圖片 URL（改用 HTTPS）
    let thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
    if (thumbnail) {
      thumbnail = thumbnail.replace('http://', 'https://');
    }

    return {
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      thumbnail,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for ISBN ${isbn}:`, error);
    return null;
  }
}

/**
 * 批次獲取書籍元資料（控制並行數量）
 */
export async function fetchBookMetadataBatch(
  isbns: string[],
  concurrency: number = 5
): Promise<Map<string, BookMetadata | null>> {
  const results = new Map<string, BookMetadata | null>();

  // 分批處理
  for (let i = 0; i < isbns.length; i += concurrency) {
    const batch = isbns.slice(i, i + concurrency);
    const promises = batch.map(async (isbn) => {
      const metadata = await fetchBookMetadata(isbn);
      return { isbn, metadata };
    });

    const batchResults = await Promise.all(promises);

    for (const { isbn, metadata } of batchResults) {
      results.set(isbn, metadata);
    }
  }

  return results;
}

/**
 * 驗證 ISBN 格式
 */
export function isValidIsbn(isbn: string): boolean {
  // 移除空格和連字號
  const cleaned = isbn.replace(/[\s-]/g, '');

  // ISBN-10: 10 位數字（最後一位可為 X）
  if (/^\d{9}[\dX]$/i.test(cleaned)) {
    return validateIsbn10(cleaned);
  }

  // ISBN-13: 13 位數字
  if (/^\d{13}$/.test(cleaned)) {
    return validateIsbn13(cleaned);
  }

  return false;
}

/**
 * ISBN-10 校驗
 */
function validateIsbn10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i], 10) * (10 - i);
  }
  const lastChar = isbn[9].toUpperCase();
  sum += lastChar === 'X' ? 10 : parseInt(lastChar, 10);
  return sum % 11 === 0;
}

/**
 * ISBN-13 校驗
 */
function validateIsbn13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return sum % 10 === 0;
}

/**
 * 標準化 ISBN（移除空格和連字號）
 */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[\s-]/g, '');
}
