import type { CapacityInfo } from '../lib/types';
import { useTranslation } from '../i18n';

interface CapacityWarningProps {
  capacityInfo: CapacityInfo;
}

export function CapacityWarning({ capacityInfo }: CapacityWarningProps) {
  const { t } = useTranslation();

  // 只在接近上限或達到上限時顯示
  if (!capacityInfo.isNearLimit && !capacityInfo.isAtLimit) {
    return null;
  }

  const isAtLimit = capacityInfo.isAtLimit;
  const percentage = Math.round(capacityInfo.percentage);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
        isAtLimit
          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      }`}
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 ${isAtLimit ? 'text-red-500' : 'text-amber-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="font-medium">
        {isAtLimit ? t('capacity.full') : t('capacity.warning')}
      </span>
      <span className="text-xs opacity-75">
        {t('capacity.usage', { percentage })}
      </span>
    </div>
  );
}
