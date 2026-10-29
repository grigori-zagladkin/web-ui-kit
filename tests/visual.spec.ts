import { expect, test } from '@playwright/test';
import { openStory, readStories, THEMES } from './storybook';

/**
 * Скриншот каждой истории Storybook в светлой и тёмной теме.
 * Теги историй:
 *   no-visual       — пропустить;
 *   visual-viewport — снимать весь экран (диалоги, меню, тосты в top layer), а не только #storybook-root.
 */
const stories = readStories();

for (const theme of THEMES) {
  test.describe(theme, () => {
    for (const story of stories) {
      test(`${story.title} › ${story.name}`, async ({ page }) => {
        await openStory(page, story.id, theme);
        const target = story.tags?.includes('visual-viewport') ? page : page.locator('#storybook-root');
        await expect(target).toHaveScreenshot(`${story.id}--${theme}.png`);
      });
    }
  });
}
