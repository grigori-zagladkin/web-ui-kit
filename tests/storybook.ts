import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export type Theme = 'light' | 'dark';
export const THEMES: Theme[] = ['light', 'dark'];

interface IndexEntry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
  tags?: string[];
}

/** Список историй из собранного Storybook (storybook-static/index.json). */
export function readStories(): IndexEntry[] {
  const indexPath = path.resolve('storybook-static', 'index.json');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Нет storybook-static/index.json. Сначала соберите Storybook: npm run build-storybook');
  }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { entries: Record<string, IndexEntry> };
  return Object.values(index.entries).filter((entry) => entry.type === 'story' && !entry.tags?.includes('no-visual'));
}

/** Открыть историю в нужной теме и дождаться стабильного состояния. */
export async function openStory(page: Page, id: string, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.goto(`/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:${theme}`);
  await page.waitForSelector('#storybook-root > *', { state: 'attached' });
  await page.waitForFunction((t) => document.documentElement.dataset.theme === t, theme);
  await page.evaluate(() => document.fonts.ready);
  // клиентские компоненты, которые монтируются после гидратации (Editor)
  await expect(page.locator('[data-editor-pending]')).toHaveCount(0);
  await page.waitForLoadState('networkidle');
}
