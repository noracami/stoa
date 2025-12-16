import { useState } from 'react';
import type { BookFormat } from '../lib/types';
import { isValidIsbn, normalizeIsbn } from '../lib/googleBooks';
import { useTranslation } from '../i18n';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (isbn: string, format: BookFormat) => { success: boolean; error?: 'duplicate' | 'capacity' };
}

export function AddBookModal({ isOpen, onClose, onAdd }: AddBookModalProps) {
  const { t } = useTranslation();
  const [isbn, setIsbn] = useState('');
  const [format, setFormat] = useState<BookFormat>('physical');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedIsbn = normalizeIsbn(isbn);

    if (!isValidIsbn(normalizedIsbn)) {
      setError(t('addBook.errors.invalidIsbn'));
      return;
    }

    const result = onAdd(normalizedIsbn, format);

    if (!result.success) {
      if (result.error === 'duplicate') {
        setError(t('addBook.errors.duplicate'));
      } else if (result.error === 'capacity') {
        setError(t('addBook.errors.capacity'));
      }
      return;
    }

    // 成功，重置表單並關閉
    setIsbn('');
    setFormat('physical');
    onClose();
  };

  const handleClose = () => {
    setIsbn('');
    setFormat('physical');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('addBook.title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ISBN 輸入 */}
          <div className="mb-4">
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('addBook.isbnLabel')}
            </label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder={t('addBook.isbnPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
              autoFocus
            />
          </div>

          {/* 格式選擇 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addBook.formatLabel')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="physical"
                  checked={format === 'physical'}
                  onChange={() => setFormat('physical')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {t('book.format.physical')}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="ebook"
                  checked={format === 'ebook'}
                  onChange={() => setFormat('ebook')}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {t('book.format.ebook')}
                </span>
              </label>
            </div>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('action.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-lg transition-colors"
            >
              {t('addBook.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
