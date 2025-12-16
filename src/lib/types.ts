/** 書籍格式 */
export type BookFormat = 'physical' | 'ebook';

/** 書籍借閱狀態 */
export type BookStatus = 'available' | 'borrowed';

/** 書籍核心資料（儲存於 URL） */
export interface Book {
  /** ISBN 編號 */
  isbn: string;
  /** 格式：紙本 / 電子書 */
  format: BookFormat;
  /** 狀態：可借閱 / 借出中 */
  status: BookStatus;
  /** 購入日期 (YYYY-MM-DD) */
  addedDate: string;
}

/** 書籍元資料（從 API 獲取，快取於 LocalStorage） */
export interface BookMetadata {
  /** 書名 */
  title: string;
  /** 作者列表 */
  authors: string[];
  /** 封面圖片 URL */
  thumbnail?: string;
  /** 出版商 */
  publisher?: string;
  /** 出版日期 */
  publishedDate?: string;
  /** 頁數 */
  pageCount?: number;
}

/** 書籍完整資訊（核心資料 + 元資料） */
export interface BookWithMetadata extends Book {
  metadata: BookMetadata | null;
  isLoadingMetadata: boolean;
}

/** 書架狀態 */
export interface BookshelfState {
  /** 書籍列表 */
  books: Book[];
  /** 資料版本號（用於未來遷移） */
  version: number;
}

/** LocalStorage 快取項目 */
export interface CachedMetadata {
  data: BookMetadata;
  cachedAt: number; // timestamp
}

/** URL 容量資訊 */
export interface CapacityInfo {
  /** 目前 URL 編碼後的 bytes 數 */
  currentBytes: number;
  /** 最大建議 bytes 數 */
  maxBytes: number;
  /** 使用百分比 */
  percentage: number;
  /** 是否接近上限（>75%） */
  isNearLimit: boolean;
  /** 是否達到上限（>95%） */
  isAtLimit: boolean;
}
