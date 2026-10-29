# @zgv/ui-kit

Минималистичный UI-кит на React + TypeScript. Компоненты по умолчанию серверные (SSR/RSC), клиентский код — только там, где без него нельзя. Светлая и тёмная темы, CSS Modules, скриншотные тесты в Docker.

```bash
npm install @zgv/ui-kit
```

Требования: React 18.3+ и бандлер с поддержкой импорта CSS из пакетов — Next.js 13.4+ (App Router), Vite, Webpack 5. Пакет только ESM.

```
ui-kit/
├── components/          компоненты: Component.tsx + Component.module.css
│   ├── theme.css        токены (цвета, отступы, радиусы) и тёмная тема
│   └── index.ts         публичный экспорт
├── utils/               cx, mergeRefs, Slot, валидация (validateValues), безопасные URL, хуки (useInput, useControllableState, …)
├── stories/             истории Storybook — они же сценарии скриншотных тестов
├── tests/               Playwright: visual.spec.ts, interactions.spec.ts, __screenshots__/
├── .storybook/          конфиг Storybook (переключатель темы в тулбаре)
├── vite.lib.config.ts  сборка npm-пакета в dist/
├── playwright.config.ts
├── docker-compose.yml   окружение для скриншотов
└── .github/workflows/   visual.yml — проверка скриншотов, visual-update.yml — обновление эталонов
```

## Подключение

```tsx
// app/layout.tsx (Next.js App Router)
import '@zgv/ui-kit/theme.css';
import { ThemeProvider, ThemeScript, Toaster } from '@zgv/ui-kit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- `ThemeScript` — серверный, ставит `data-theme` на `<html>` до отрисовки, поэтому нет вспышки светлой темы.
- `ThemeProvider` — клиентский, хранит выбор в `localStorage` и cookie `ui-theme`, отдаёт `useTheme()`:

```tsx
'use client';
const { theme, resolvedTheme, setTheme } = useTheme(); // theme: 'light' | 'dark' | 'system'
```

Без провайдера тема берётся из системных настроек (`prefers-color-scheme`).

## Компоненты

| Серверные (без хуков) | Клиентские (`'use client'`) |
|---|---|
| Button (и ссылки), Badge, Avatar, Spinner, Skeleton, Separator | Popover — позиционирование |
| Field, Input, Textarea, Select, Checkbox, Radio/RadioGroup, Switch | DropdownMenu — клавиатурная навигация |
| Card, Alert, Progress, EmptyState, Breadcrumbs, Pagination | Dialog — `showModal()` |
| Accordion (`<details>`), Tooltip (CSS) | Tabs — клавиатурная навигация |
| EditorViewer (просмотр документа), ThemeScript | Form, DataView, Editor, CopyButton, Toast/Toaster, ThemeProvider |

Интерактив, где возможно, отдан браузеру: `<dialog>`, Popover API, `<details name>`, `:has()`, `field-sizing`.

### Button — кнопки и ссылки

С `href` рендерится `<a>`, без — `<button>`. Отдельного Link нет.

```tsx
<Button variant="primary" icon={<Plus />}>Создать</Button>
<Button iconOnly icon={<Settings />} aria-label="Настройки" />   {/* aria-label обязателен на уровне типов */}

<Button variant="link" href="/rules">правила сервиса</Button>          {/* ссылка в тексте */}
<Button variant="link-muted" href="/settings">Настройки</Button>       {/* тихая ссылка */}
<Button variant="link" href="https://example.com" external>Сайт</Button> {/* новая вкладка + ↗ */}
<Button variant="link" onClick={loadMore}>Показать ещё</Button>        {/* выглядит как ссылка, но это button */}
<Button variant="primary" href="/signup">Начать</Button>               {/* кнопка-ссылка */}

<Button asChild variant="link"><NextLink href="/docs">Документация</NextLink></Button>  {/* next/link */}
```

Недоступная ссылка (`disabled`) теряет `href` и получает `aria-disabled` — не кликается и не попадает в Tab-порядок.

### Field

Связывает label, подсказку и ошибку с контролом через `cloneElement` — работает на сервере, `id` обязателен:

```tsx
<Field id="email" label="Email" hint="Пришлём ссылку" error={errors.email} required>
  <Input type="email" />
</Field>
```

### DataView — таблица и список

Один компонент, два вида (`view="table" | "list"`), общее состояние. Движок — `@tanstack/react-table`.

```tsx
const columns: DataViewColumn<User>[] = [
  { id: 'name', header: 'Имя', accessor: 'name', sticky: 'left', cell: ({ row }) => <UserCell user={row} /> },
  { id: 'department', header: 'Отдел', accessor: 'department', groupable: true },
  { id: 'salary', header: 'Зарплата', accessor: 'salary', align: 'right' },
];

<DataView
  data={users}
  columns={columns}
  getRowId={(u) => u.id}
  searchable
  showColumnSettings
  enableColumnResize
  selectionMode="multiple"
  pageSize={20}
/>
```

Возможности: сортировка, поиск, выделение (single/multiple), раскрытие строк (`renderExpanded`) и деревья (`getSubRows`), группировка, закреплённые колонки, ресайз, показ/скрытие и порядок колонок, пагинация, состояния loading/empty/error, плотность.

Любое состояние можно контролировать (`sorting` + `onSortingChange` и т.д.). **Серверный режим** — `manualSorting`, `manualFiltering`, `manualPagination` + `rowCount`: компонент только сообщает об изменениях, данные приходят с сервера.

**Сохранение настроек колонок:**

```tsx
const saved = JSON.parse(localStorage.getItem('users-table') ?? '{}');

<DataView
  defaultColumnVisibility={saved.visibility}
  defaultColumnOrder={saved.order}
  defaultColumnSizing={saved.sizing}
  onColumnVisibilityChange={(visibility) => save({ ...saved, visibility })}
  onColumnOrderChange={(order) => save({ ...saved, order })}
  onColumnSizingChange={(sizing) => save({ ...saved, sizing })}
  …
/>
```

### Form — генератор форм

Поля описываются массивом, форма рисует их сама: сетка, секции, подписи, ошибки, кнопки.

```tsx
'use client';
import { Form, type FormFieldConfig } from '@zgv/ui-kit';

// type, а не interface: interface не совместим с Record<string, unknown>
type SignUp = { name: string; email: string; password: string; confirm: string; role: string; terms: boolean };

const fields: FormFieldConfig<SignUp>[] = [
  { type: 'section', title: 'Аккаунт' },
  { type: 'text', name: 'name', label: 'Имя', required: true, minLength: 2 },
  { type: 'email', name: 'email', label: 'Email', required: true,
    validate: async (email) => (await isTaken(email)) ? 'Email уже занят' : undefined },
  { type: 'password', name: 'password', label: 'Пароль', required: true, minLength: 8,
    pattern: /\d/, messages: { pattern: 'Добавьте цифру' } },
  { type: 'password', name: 'confirm', label: 'Повторите пароль', required: true },
  { type: 'select', name: 'role', label: 'Роль', required: true, options: [{ value: 'dev', label: 'Разработчик' }] },
  { type: 'checkbox', name: 'terms', label: 'Принимаю условия', required: true, span: 'full' },
];

<Form
  fields={fields}
  initialValues={{ name: '', email: '', password: '', confirm: '', role: '', terms: false }}
  validate={(v) => (v.password !== v.confirm ? { confirm: 'Пароли не совпадают' } : undefined)}
  columns={2}
  submitLabel="Зарегистрироваться"
  successMessage="Аккаунт создан"
  onSubmit={async (values) => {
    const res = await api.signUp(values);
    if (res.emailTaken) return { fieldErrors: { email: 'Email уже зарегистрирован' } };  // ошибка с сервера → у поля
  }}
/>
```

**Типы полей:** `text`, `email`, `password`, `tel`, `url`, `search`, `number`, `date`, `time`, `datetime-local`, `textarea`, `select`, `radio`, `checkboxes` (массив значений), `checkbox`, `switch`, `richtext` (Editor, грузится лениво), `custom` (свой рендер через `render`), `section` (заголовок группы).

**Правила:** `required`, `minLength`/`maxLength` (для richtext — по тексту), `min`/`max` (числа и даты), `pattern`, `minItems`/`maxItems`, встроенные проверки email и url, `validate` — своя проверка, может быть асинхронной. Тексты ошибок переопределяются через `messages`.

**Ещё:**
- `when: (values) => boolean` — условное поле; скрытые поля не валидируются.
- `disabled` — флаг или функция от значений; `span` — ширина в колонках сетки (`'full'` — вся строка). В узком контейнере форма сама перестраивается в одну колонку.
- `validate` у формы — проверки между полями; `schema` — Zod / Valibot / ArkType (любая [Standard Schema](https://standardschema.dev)), без лишних зависимостей в ките.

**Когда показываются ошибки:** по умолчанию после ухода с поля (`validateOn="blur"`). Если ошибка уже показана, она исчезает прямо при вводе. После первой отправки все ошибки обновляются на лету. При отправке фокус уходит на первое поле с ошибкой. Асинхронные проверки запускаются только на blur и при отправке, не на каждый символ.

**Серверная проверка тем же описанием полей** — `validateValues` из `utils` не зависит от React и `'use client'`:

```ts
// signup-fields.ts — общий файл: только данные, без JSX-рендеров
export const signUpFields = [ … ] satisfies FormFieldConfig<SignUp>[];

// app/actions.ts
'use server';
import { validateValues } from '@zgv/ui-kit/utils';
const errors = await validateValues(signUpFields, values);
if (Object.keys(errors).length) return { fieldErrors: errors };
```

**Без JavaScript.** До гидратации форма — обычный `<form>` с нативными `required`, `minLength`, `pattern`, `type="email"`, и браузер проверяет их сам. С `action` (URL или server action) она отправится и без JS. Ошибки, которые сервер вернул после такой отправки, передайте в `initialErrors` и `formError`.

### Editor и EditorViewer

Редактор на Tiptap, документ хранится в JSON.

```tsx
'use client';
const [doc, setDoc] = useState<JSONContent>();
<Editor value={doc} onChange={setDoc} placeholder="Опишите задачу…" maxLength={5000} onImageUpload={uploadToS3} />
```

**EditorViewer** — серверный просмотрщик сохранённого документа:

```tsx
<EditorViewer content={article.body} />
<EditorViewer content={article.body} toc size="lg" />                       {/* оглавление справа */}
<EditorViewer content={doc} toc={{ position: 'top', levels: [2] }} />          {/* оглавление сверху, только h2 */}
<EditorViewer content={doc} empty={<EmptyState title="Описания пока нет" />} />
```

- JSON рендерится прямо в React-элементы, без `dangerouslySetInnerHTML` и без загрузки Tiptap. На странице просмотра редактор весит 0 КБ.
- Оглавление строится по заголовкам. У заголовков стабильные id (`#подготовка`) и якорь-ссылка при наведении. `getTableOfContents(doc)` отдаёт оглавление отдельно, если нужно нарисовать его где-то ещё.
- У блоков кода есть язык и кнопка «Скопировать» (клиентский островок `CopyButton`).
- У картинок подпись из `title`, ленивая загрузка.
- Размеры текста: `sm`, `md`, `lg`.
- Ссылки и картинки фильтруются по протоколу: `http`, `https`, `mailto`, `tel`, относительные. `javascript:` и `data:` превращаются в обычный текст или пропускаются.

Узлы документа задаёт `getEditorExtensions()` в `Editor.tsx`. Добавляете расширение Tiptap — добавьте и его рендер в `EditorViewer.tsx`. Неизвестные узлы вьювер не теряет: показывает их текст.

## Скриншотные тесты

**Как устроено.** Каждая история Storybook снимается Playwright'ом в светлой и тёмной теме и сравнивается с эталоном в `tests/__screenshots__/`. Отдельно `interactions.spec.ts` снимает то, что не задать пропсами: hover, фокус с клавиатуры, открытие меню и диалога по клику, ввод в редактор.

Тесты запускаются **в Docker** — в официальном образе Playwright. Шрифты и сглаживание отличаются между Windows, macOS и Linux, поэтому эталоны, снятые «просто на компьютере», будут падать на другой машине и в CI. В контейнере рендеринг одинаковый везде.

### Что нужно

- Docker Desktop (Windows/macOS) или Docker Engine (Linux).
- Больше ничего: Node, браузеры и зависимости ставятся внутри контейнера.

### Первый запуск — создать эталоны

```bash
docker compose run --rm visual-update
```

Соберёт Storybook, снимет все истории и положит PNG в `tests/__screenshots__/`. Просмотрите несколько картинок глазами и закоммитьте папку — это эталоны.

### Проверка

```bash
docker compose run --rm visual
```

Если что-то разошлось, отчёт с диффами (было / стало / разница) — в `playwright-report/index.html`.

### Изменили компонент намеренно

```bash
docker compose run --rm visual-update
```

Затем посмотрите `git diff` по PNG (GitHub и GitLab показывают картинки side-by-side) и закоммитьте новые эталоны вместе с изменением компонента.

### Удобные мелочи

- `npm run storybook` — Storybook для разработки на http://localhost:6006 (тема переключается в тулбаре).
- Можно гонять тесты без Docker (`npx playwright install chromium && npm run visual:ci`) — для отладки сценариев. Но эталоны генерируйте только в Docker.
- Первый запуск `docker compose` скачает образ (~1,5 ГБ) и поставит зависимости в отдельный volume — дальше быстрее.

### Теги историй

```tsx
export const Open: Story = { tags: ['visual-viewport'], … }  // снимать весь экран: диалоги, меню, тосты
export const Playground: Story = { tags: ['no-visual'], … }  // не снимать (живые демо, случайные данные)
```

### Новый компонент

1. `components/Foo.tsx` + `components/Foo.module.css`, экспорт в `components/index.ts`.
2. `stories/Foo.stories.tsx` с `title: 'Components/Foo'` — истории с вариантами и состояниями.
3. Если есть hover/клавиатура/клик — сценарий в `tests/interactions.spec.ts`.
4. `docker compose run --rm visual-update` и коммит эталонов.

### CI

`.github/workflows/visual.yml` запускает typecheck и скриншоты в том же образе, при падении прикладывает отчёт. Для GitLab — тот же образ `mcr.microsoft.com/playwright:v1.49.1-noble` и команды `npm install && npm run visual:ci`.

**Важно:** версия образа в `docker-compose.yml` и CI должна совпадать с версией `@playwright/test` в `package.json`. Обновляете Playwright — обновите образ и перегенерируйте эталоны.

## Ограничения и заметки

- **Браузеры:** Popover API и `<dialog>` — Chrome 114+, Safari 17+, Firefox 125+. `field-sizing` (автовысота Textarea) пока только в Chromium — в остальных обычный ресайз.
- **Tooltip** — только CSS, без автопереворота у краёв экрана. Для подсказок у края используйте `side`.
- **Popover/DropdownMenu** — триггер должен быть `<button>` (или `Button`): открытие через нативный `popovertarget`.
- **Checkbox `indeterminate`** рисуется через data-атрибут и `aria-checked="mixed"`, нативное свойство не выставляется (это потребовало бы JS).
- **RadioGroup** работает на сервере с `defaultValue`. `value` + `onValueChange` — только внутри клиентских компонентов (функции нельзя передать из RSC).
- **DataView** без виртуализации — для тысяч строк используйте серверную пагинацию или добавьте `@tanstack/react-virtual`.
- **Form** — значения хранятся в одном объекте и вся форма перерисовывается при вводе. Для форм на десятки полей это незаметно; для сотен полей лучше разбить на шаги.
- **EditorViewer** — оглавление без подсветки текущего раздела при прокрутке (это потребовало бы клиентский IntersectionObserver).
- **Зависимости** — коммитьте `package-lock.json`: Docker и CI ставят пакеты по нему. Все пакеты `@tiptap/*` должны быть одной версии, иначе сборка падает на несовпадении экспортов.

## Эталоны без Docker

Если Docker под рукой нет, эталоны снимает GitHub Actions в том же образе Playwright: **Actions → Update screenshots → Run workflow**. Workflow `visual-update.yml` прогонит `--update-snapshots` и закоммитит `tests/__screenshots__/` в выбранную ветку. Снимать эталоны на Windows или macOS без Docker нельзя: шрифты и сглаживание отличаются, и проверка в CI будет падать.

## Сборка и публикация пакета

```bash
npm run build      # dist/: JS по файлу на модуль, CSS по файлу на компонент, .d.ts
npm pack           # zgv-ui-kit-<версия>.tgz — посмотреть, что уйдёт в npm
```

Как устроен пакет:
- **Один JS-файл на модуль** (`preserveModules`) — у потребителя работает tree-shaking: импортировали `Button`, в бандл попали только Button.js и его CSS.
- **CSS компонента подключается из его JS** (`import './Button.module.css'`), классы с префиксом `ui-`. Отдельно — `@zgv/ui-kit/theme.css` с токенами, подключается один раз.
- **`'use client'` сохраняется** у клиентских компонентов и хуков, серверные остаются серверными.
- **Зависимости не вшиты**: React — peer, Tiptap, TanStack Table и lucide-react ставятся вместе с пакетом. Tiptap попадает в бандл, только если используется `Editor` (`Form` грузит его лениво).

Публикация (scope `@zgv` должен совпадать с вашим npm-логином или организацией):

```bash
npm login
npm version patch  # или minor / major
npm publish        # prepublishOnly сам запустит typecheck и build
```
