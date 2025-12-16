import { useState } from 'react';
import { useTranslation } from '../i18n';

interface ShareButtonProps {
  bookCount: number;
  getShareUrl: () => string;
}

export function ShareButton({ bookCount, getShareUrl }: ShareButtonProps) {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleShare = async () => {
    const url = getShareUrl();

    try {
      await navigator.clipboard.writeText(url);
      setToastMessage(t('share.copied'));
    } catch {
      setToastMessage(t('share.copyFailed'));
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={bookCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span className="text-sm font-medium">{t('action.share')}</span>
        {bookCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({t('share.bookCount', { count: bookCount })})
          </span>
        )}
      </button>

      {/* Toast 訊息 */}
      {showToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap z-10">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
