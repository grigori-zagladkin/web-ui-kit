import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import type { JSONContent } from '@tiptap/core';
import { Link2 } from 'lucide-react';
import { cx } from '../utils/cx';
import { isSafeHref, isSafeImageSrc } from '../utils/url';
import { CopyButton } from './CopyButton';
import styles from './EditorViewer.module.css';

export type { JSONContent };

/** Класс с типографикой документа — общий для Editor и EditorViewer. */
export const proseClassName = styles.prose as string;

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

export interface EditorViewerProps extends Omit<HTMLAttributes<HTMLElement>, 'content' | 'children'> {
  /** Документ в формате Tiptap JSON — то, что отдаёт `onChange` у Editor. */
  content: JSONContent | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  /** Оглавление по заголовкам. `true` — справа, или настройки. */
  toc?: boolean | { position?: 'left' | 'right' | 'top'; title?: ReactNode; levels?: number[] };
  /** Ссылка-якорь «#» у заголовков (по умолчанию включена вместе с оглавлением). */
  headingAnchors?: boolean;
  /** Кнопка «Скопировать» у блоков кода. */
  copyCode?: boolean;
  /** Префикс id заголовков — если на странице несколько документов. */
  idPrefix?: string;
  /** Что показать, если документ пустой. */
  empty?: ReactNode;
}

// ── Подготовка ──────────────────────────────────────────────────────────

function textOf(node: JSONContent | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(textOf).join('');
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

/** Заголовки документа с уникальными id — для оглавления и якорей. */
export function getTableOfContents(content: JSONContent | null | undefined, idPrefix = ''): TocItem[] {
  const items: TocItem[] = [];
  const used = new Map<string, number>();
  const walk = (node: JSONContent) => {
    if (node.type === 'heading') {
      const text = textOf(node);
      const base = idPrefix + slugify(text);
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      items.push({ id: count ? `${base}-${count + 1}` : base, level: Number(node.attrs?.level ?? 1), text });
      return;
    }
    node.content?.forEach(walk);
  };
  if (content) walk(content);
  return items;
}

function isEmptyDoc(content: JSONContent | null | undefined): boolean {
  if (!content) return true;
  const hasSomething = (node: JSONContent): boolean =>
    (node.type === 'text' && Boolean(node.text?.trim())) ||
    node.type === 'image' ||
    node.type === 'horizontalRule' ||
    (node.content ?? []).some(hasSomething);
  return !hasSomething(content);
}

// ── Рендер JSON → React ─────────────────────────────────────────────────

interface RenderContext {
  headings: TocItem[];
  headingIndex: number;
  anchors: boolean;
  copyCode: boolean;
}

function renderMarks(node: JSONContent, key: number): ReactNode {
  let result: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        result = <strong>{result}</strong>;
        break;
      case 'italic':
        result = <em>{result}</em>;
        break;
      case 'strike':
        result = <s>{result}</s>;
        break;
      case 'code':
        result = <code>{result}</code>;
        break;
      case 'link': {
        const href = String(mark.attrs?.href ?? '');
        if (!isSafeHref(href)) break;
        const external = /^https?:/i.test(href);
        result = (
          <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : null)}>
            {result}
          </a>
        );
        break;
      }
      // неизвестные метки (underline, highlight из будущих расширений) — просто текст
    }
  }
  return <Fragment key={key}>{result}</Fragment>;
}

function renderChildren(node: JSONContent, ctx: RenderContext): ReactNode {
  return node.content?.map((child, i) => renderNode(child, ctx, i));
}

function renderNode(node: JSONContent, ctx: RenderContext, key: number): ReactNode {
  switch (node.type) {
    case 'doc':
      return renderChildren(node, ctx);
    case 'text':
      return renderMarks(node, key);
    case 'paragraph':
      return <p key={key}>{renderChildren(node, ctx)}</p>;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 3);
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      const heading = ctx.headings[ctx.headingIndex++];
      return (
        <Tag key={key} id={heading?.id} className={styles.heading}>
          {renderChildren(node, ctx)}
          {ctx.anchors && heading && (
            <a href={`#${heading.id}`} className={styles.anchor} aria-label={`Ссылка на раздел «${heading.text}»`}>
              <Link2 aria-hidden="true" />
            </a>
          )}
        </Tag>
      );
    }
    case 'bulletList':
      return <ul key={key}>{renderChildren(node, ctx)}</ul>;
    case 'orderedList':
      return (
        <ol key={key} start={typeof node.attrs?.start === 'number' && node.attrs.start !== 1 ? node.attrs.start : undefined}>
          {renderChildren(node, ctx)}
        </ol>
      );
    case 'listItem':
      return <li key={key}>{renderChildren(node, ctx)}</li>;
    case 'blockquote':
      return <blockquote key={key}>{renderChildren(node, ctx)}</blockquote>;
    case 'codeBlock': {
      const code = textOf(node);
      const language = typeof node.attrs?.language === 'string' ? node.attrs.language : undefined;
      return (
        <div key={key} className={styles.codeBlock}>
          {(language || ctx.copyCode) && (
            <div className={styles.codeHeader}>
              <span className={styles.codeLanguage}>{language}</span>
              {ctx.copyCode && <CopyButton text={code} label="Скопировать код" />}
            </div>
          )}
          <pre>
            <code data-language={language}>{code}</code>
          </pre>
        </div>
      );
    }
    case 'horizontalRule':
      return <hr key={key} />;
    case 'hardBreak':
      return <br key={key} />;
    case 'image': {
      const src = String(node.attrs?.src ?? '');
      if (!isSafeImageSrc(src)) return null;
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      const title = typeof node.attrs?.title === 'string' ? node.attrs.title : undefined;
      return (
        <figure key={key} className={styles.figure}>
          <img src={src} alt={alt} loading="lazy" decoding="async" />
          {title && <figcaption>{title}</figcaption>}
        </figure>
      );
    }
    default:
      // неизвестный узел: показываем содержимое, чтобы не терять текст
      return node.content ? <div key={key}>{renderChildren(node, ctx)}</div> : null;
  }
}

// ── Компонент ───────────────────────────────────────────────────────────

/**
 * Серверный просмотрщик документа из Editor. JSON рендерится прямо в React-элементы:
 * без `dangerouslySetInnerHTML` и без загрузки редактора. Ссылки и картинки фильтруются по протоколу.
 * Клиентский код — только кнопки копирования кода.
 */
export function EditorViewer({
  content,
  size = 'md',
  toc = false,
  headingAnchors,
  copyCode = true,
  idPrefix = '',
  empty,
  className,
  ...props
}: EditorViewerProps) {
  if (isEmptyDoc(content)) {
    return empty ? <div className={className}>{empty}</div> : null;
  }

  const tocOptions = toc === true ? {} : toc || undefined;
  const headings = getTableOfContents(content, idPrefix);
  const ctx: RenderContext = {
    headings,
    headingIndex: 0,
    anchors: headingAnchors ?? Boolean(tocOptions),
    copyCode,
  };

  const article = (
    <article className={cx(styles.prose, styles[size], !tocOptions && className)} {...(tocOptions ? null : props)}>
      {content && renderNode(content, ctx, 0)}
    </article>
  );

  if (!tocOptions) return article;

  const levels = tocOptions.levels ?? [1, 2, 3];
  const tocItems = headings.filter((h) => levels.includes(h.level));
  if (tocItems.length === 0) return article;
  const minLevel = Math.min(...tocItems.map((h) => h.level));
  const position = tocOptions.position ?? 'right';

  return (
    <div className={cx(styles.layout, styles[`toc-${position}`], className)} {...props}>
      <nav className={styles.toc} aria-label="Содержание">
        <p className={styles.tocTitle}>{tocOptions.title ?? 'Содержание'}</p>
        <ul className={styles.tocList}>
          {tocItems.map((item) => (
            <li key={item.id} style={{ paddingLeft: `${(item.level - minLevel) * 12}px` }}>
              <a href={`#${item.id}`} className={styles.tocLink}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {article}
    </div>
  );
}
