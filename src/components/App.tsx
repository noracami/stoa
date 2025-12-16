import { useState } from 'react';
import type { BookFormat } from '../lib/types';
import { I18nContext, createI18nValue } from '../i18n';
import { useUrlState } from '../hooks/useUrlState';
import { useBookApi } from '../hooks/useBookApi';
import { ThemeToggle } from './ThemeToggle';
import { BookList } from './BookList';
import { AddBookModal } from './AddBookModal';
import { ShareButton } from './ShareButton';
import { CapacityWarning } from './CapacityWarning';
import { useTranslation } from '../i18n';

declare const __COMMIT_SHA__: string;
declare const __GITHUB_REPOSITORY__: string;

function CommitBadge() {
  const sha = typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'dev';
  const repo = typeof __GITHUB_REPOSITORY__ !== 'undefined' ? __GITHUB_REPOSITORY__ : 'noracami/stoa';
  const shortSha = sha.slice(0, 6);
  const url = `https://github.com/${repo}/tree/${sha}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Commit: ${sha}`}
    >
      {shortSha}
    </a>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const {
    books,
    capacityInfo,
    isInitialized,
    addBook,
    removeBook,
    toggleBookStatus,
    getShareUrl,
  } = useUrlState();
  const { booksWithMetadata } = useBookApi(books);

  const handleAddBook = (isbn: string, format: BookFormat) => {
    return addBook({ isbn, format, status: 'available' });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('app.title')}
              </h1>
              <CommitBadge />
            </div>
            <div className="flex items-center gap-3">
              <CapacityWarning capacityInfo={capacityInfo} />
              <ShareButton bookCount={books.length} getShareUrl={getShareUrl} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BookList
          books={booksWithMetadata}
          onToggleStatus={toggleBookStatus}
          onDelete={removeBook}
        />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        disabled={capacityInfo.isAtLimit}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        title={t('action.add')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBook}
      />
    </div>
  );
}

export function App() {
  const i18nValue = createI18nValue('zh-TW');

  return (
    <I18nContext.Provider value={i18nValue}>
      <AppContent />
    </I18nContext.Provider>
  );
}
