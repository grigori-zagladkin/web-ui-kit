import type { JSONContent } from '../components/EditorViewer';

/** Тестовые документы для историй Editor и EditorViewer. */

const text = (value: string, marks?: JSONContent['marks']): JSONContent => ({ type: 'text', text: value, ...(marks ? { marks } : null) });
const p = (...content: JSONContent[]): JSONContent => ({ type: 'paragraph', content });
const h = (level: number, value: string): JSONContent => ({ type: 'heading', attrs: { level }, content: [text(value)] });
const li = (...content: JSONContent[]): JSONContent => ({ type: 'listItem', content: [p(...content)] });

export const shortDoc: JSONContent = {
  type: 'doc',
  content: [
    h(2, 'План релиза'),
    p(
      text('Выпускаем новую версию '),
      text('в пятницу', [{ type: 'bold' }]),
      text('. Подробности — в '),
      text('документации', [{ type: 'link', attrs: { href: 'https://example.com' } }]),
      text('.'),
    ),
    { type: 'bulletList', content: [li(text('Новый редактор')), li(text('Экспорт в '), text('xlsx', [{ type: 'code' }]))] },
    { type: 'blockquote', content: [p(text('Не забыть обновить changelog.'))] },
  ],
};

export const articleDoc: JSONContent = {
  type: 'doc',
  content: [
    h(1, 'Руководство по деплою'),
    p(
      text('Этот документ описывает, как выкатить сервис в '),
      text('production', [{ type: 'italic' }]),
      text(' и что делать, если что-то пошло не так.'),
    ),
    h(2, 'Подготовка'),
    p(text('Перед релизом убедитесь, что:')),
    {
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        li(text('все тесты зелёные')),
        li(text('миграции проверены на копии базы')),
        li(text('changelog обновлён — '), text('без этого релиз не пройдёт ревью', [{ type: 'bold' }])),
      ],
    },
    h(2, 'Выкатка'),
    p(text('Запустите скрипт из корня репозитория:')),
    {
      type: 'codeBlock',
      attrs: { language: 'bash' },
      content: [text('npm run build\nnpm run deploy -- --env production')],
    },
    h(3, 'Канареечный релиз'),
    p(text('Сначала новая версия получает 5% трафика. Следите за графиками ошибок 15 минут.')),
    { type: 'image', attrs: { src: '/landscape.svg', alt: 'Схема канареечного релиза', title: 'Трафик постепенно переводится на новую версию' } },
    h(2, 'Откат'),
    { type: 'blockquote', content: [p(text('Если ошибок больше 1% — откатывайтесь сразу, разбираться будем потом.'))] },
    p(
      text('Команда отката: '),
      text('npm run rollback', [{ type: 'code' }]),
      text('. Опасные ссылки вроде '),
      text('этой', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]),
      text(' вьювер превращает в обычный текст.'),
    ),
    { type: 'horizontalRule' },
    p(text('Вопросы — в канал '), text('#deploy', [{ type: 'link', attrs: { href: '#deploy' } }]), text('.')),
  ],
};
