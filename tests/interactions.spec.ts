import { expect, test } from '@playwright/test';
import { openStory } from './storybook';

/**
 * Состояния, которые нельзя задать пропсами: hover, фокус с клавиатуры, открытие по клику.
 * Снимаются только в светлой теме — цвета тем уже покрыты visual.spec.ts.
 */

test('Button: hover и focus-visible', async ({ page }) => {
  await openStory(page, 'components-button--variants', 'light');
  const root = page.locator('#storybook-root');

  await page.getByRole('button', { name: 'Primary' }).first().hover();
  await expect(root).toHaveScreenshot('interaction-button-hover.png');

  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await expect(root).toHaveScreenshot('interaction-button-focus.png');
});

test('Input: фокус', async ({ page }) => {
  await openStory(page, 'components-input--states', 'light');
  await page.getByPlaceholder('Обычное').focus();
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-input-focus.png');
});

test('DropdownMenu: открытие по клику и навигация стрелками', async ({ page }) => {
  await openStory(page, 'components-dropdownmenu--closed', 'light');
  await page.getByRole('button', { name: 'Действия' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(page).toHaveScreenshot('interaction-dropdown-open.png');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
});

test('Dialog: открытие и закрытие по Esc', async ({ page }) => {
  await openStory(page, 'components-dialog--with-trigger', 'light');
  await page.getByRole('button', { name: 'Удалить проект' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveScreenshot('interaction-dialog-open.png');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Tabs: переключение стрелками', async ({ page }) => {
  await openStory(page, 'components-tabs--line', 'light');
  await page.getByRole('tab', { name: 'Обзор' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Активность' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-tabs-keyboard.png');
});

test('Tooltip: показ по hover', async ({ page }) => {
  await openStory(page, 'components-tooltip--hover', 'light');
  await page.getByRole('button', { name: 'Наведи на меня' }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-tooltip-hover.png');
});

test('DataView: сортировка по клику на заголовок', async ({ page }) => {
  await openStory(page, 'components-dataview--table', 'light');
  await page.getByRole('button', { name: /Зарплата/ }).click();
  await expect(page.getByRole('columnheader', { name: /Зарплата/ })).toHaveAttribute('aria-sort', 'ascending');
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-dataview-sorted.png');
});

test('DataView: поиск', async ({ page }) => {
  await openStory(page, 'components-dataview--table', 'light');
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('дизайн');
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-dataview-search.png');
});

test('Editor: ввод и форматирование', async ({ page }) => {
  await openStory(page, 'components-editor--empty', 'light');
  const editor = page.getByRole('textbox', { name: 'Текстовый редактор' });
  await editor.click();
  await page.keyboard.type('Привет, ');
  await page.keyboard.press('Control+b');
  await page.keyboard.type('мир');
  await expect(editor.locator('strong')).toHaveText('мир');
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-editor-typing.png');
});

test('Form: отправка пустой формы показывает ошибки и фокусирует первое поле', async ({ page }) => {
  await openStory(page, 'components-form--registration', 'light');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText('Необходимо отметить')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Имя' })).toBeFocused();
  await expect(page.locator('#storybook-root')).toHaveScreenshot('interaction-form-errors.png');
});

test('Form: ошибка исправляется на лету, проверка паролей и асинхронная проверка email', async ({ page }) => {
  await openStory(page, 'components-form--registration', 'light');
  const name = page.getByRole('textbox', { name: 'Имя' });
  await name.fill('А');
  await name.blur();
  await expect(page.getByText('Минимум 2 символа')).toBeVisible();
  await name.fill('Анна');
  await expect(page.getByText('Минимум 2 символа')).toBeHidden();

  const email = page.getByRole('textbox', { name: 'Email' });
  await email.fill('taken@example.com');
  await email.blur();
  await expect(page.getByText('Этот email уже зарегистрирован')).toBeVisible();

  await page.getByLabel('Пароль', { exact: true }).fill('secret123');
  await page.getByLabel('Повторите пароль').fill('secret124');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText('Пароли не совпадают')).toBeVisible();
});

test('Form: успешная отправка', async ({ page }) => {
  await openStory(page, 'components-form--registration', 'light');
  await page.getByRole('textbox', { name: 'Имя' }).fill('Анна Смирнова');
  await page.getByRole('textbox', { name: 'Email' }).fill('anna@company.ru');
  await page.getByLabel('Пароль', { exact: true }).fill('secret123');
  await page.getByLabel('Повторите пароль').fill('secret123');
  await page.getByRole('combobox', { name: 'Роль' }).selectOption('dev');
  await page.getByRole('checkbox', { name: 'Frontend' }).check();
  await page.getByRole('checkbox', { name: 'Принимаю условия использования' }).check();
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText('Аккаунт создан')).toBeVisible();
  await expect(page.getByTestId('result')).toContainText('"email": "anna@company.ru"');
});

test('Form: условные поля и ошибка с сервера', async ({ page }) => {
  await openStory(page, 'components-form--conditional-fields', 'light');
  await expect(page.getByRole('textbox', { name: 'Адрес' })).toBeVisible();
  await page.getByRole('radio', { name: /Самовывоз/ }).check();
  await expect(page.getByRole('textbox', { name: 'Адрес' })).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'Пункт выдачи' })).toBeVisible();

  await page.getByRole('radio', { name: /Курьер/ }).check();
  await page.getByRole('textbox', { name: 'Город' }).fill('Атлантида');
  await page.getByRole('textbox', { name: 'Адрес' }).fill('ул. Морская, 1');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByText('В этот город не доставляем')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Город' })).toBeFocused();
});

test('EditorViewer: оглавление ведёт к заголовку, опасная ссылка не рендерится', async ({ page }) => {
  await openStory(page, 'components-editorviewer--with-table-of-contents', 'light');
  await page.getByRole('navigation', { name: 'Содержание' }).getByRole('link', { name: 'Откат' }).click();
  // в URL кириллица в хэше будет percent-кодирована, поэтому проверяем сам переход
  await expect(page.getByRole('heading', { name: 'Откат' })).toBeInViewport();
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
});
