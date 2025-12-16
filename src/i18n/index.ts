import { createContext, useContext, useCallback } from 'react';
import zhTW from './locales/zh-TW.json';

/** 支援的語言 */
export type Locale = 'zh-TW';

/** 語言檔案映射 */
const locales: Record<Locale, typeof zhTW> = {
  'zh-TW': zhTW,
};

/** 預設語言 */
export const defaultLocale: Locale = 'zh-TW';

/** i18n Context 型別 */
interface I18nContextType {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** i18n Context */
export const I18nContext = createContext<I18nContextType | null>(null);

/**
 * 取得翻譯文字
 */
function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const messages = locales[locale];
  const keys = key.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation key is not a string: ${key}`);
    return key;
  }

  // 替換參數
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() ?? `{${paramKey}}`;
    });
  }

  return value;
}

/**
 * i18n Hook
 */
export function useTranslation() {
  const context = useContext(I18nContext);

  // 如果沒有 Provider，使用預設語言
  const locale = context?.locale ?? defaultLocale;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  return { t, locale };
}

/**
 * 建立 i18n Context 值
 */
export function createI18nValue(locale: Locale = defaultLocale): I18nContextType {
  return {
    locale,
    t: (key: string, params?: Record<string, string | number>) =>
      getTranslation(locale, key, params),
  };
}
