// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// 從環境變數讀取 GitHub Pages 設定
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'stoa';
const SITE = process.env.GITHUB_PAGES_URL || `https://${process.env.GITHUB_REPOSITORY_OWNER || 'localhost'}.github.io`;
const COMMIT_SHA = process.env.COMMIT_SHA || 'dev';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'noracami/stoa';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: `/${REPO_NAME}`,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __COMMIT_SHA__: JSON.stringify(COMMIT_SHA),
      __GITHUB_REPOSITORY__: JSON.stringify(GITHUB_REPOSITORY),
    }
  }
});
