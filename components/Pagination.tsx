import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Pagination.module.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Текущая страница, с 1. */
  page: number;
  pageCount: number;
  /**
   * Ссылки на страницы — для серверной пагинации без JS (`?page=3`).
   * Если не задано, рендерятся кнопки и вызывается `onPageChange`.
   */
  getHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
  /** Сколько страниц показывать по бокам от текущей. */
  siblingCount?: number;
  size?: 'sm' | 'md';
}

type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

export function getPageRange(page: number, pageCount: number, siblingCount = 1): PageToken[] {
  const totalSlots = siblingCount * 2 + 5;
  if (pageCount <= totalSlots) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const start = Math.max(2, page - siblingCount);
  const end = Math.min(pageCount - 1, page + siblingCount);
  const showStartEllipsis = start > 3;
  const showEndEllipsis = end < pageCount - 2;

  const range: PageToken[] = [1];
  if (showStartEllipsis) range.push('ellipsis-start');
  else for (let i = 2; i < start; i++) range.push(i);
  for (let i = start; i <= end; i++) range.push(i);
  if (showEndEllipsis) range.push('ellipsis-end');
  else for (let i = end + 1; i < pageCount; i++) range.push(i);
  range.push(pageCount);
  return range;
}

export function Pagination({
  page,
  pageCount,
  getHref,
  onPageChange,
  siblingCount = 1,
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Страницы',
  ...props
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const renderControl = (target: number, content: ReactNode, opts: { label?: string; current?: boolean; disabled?: boolean } = {}) => {
    const classes = cx(styles.item, opts.current && styles.current);
    if (opts.disabled) {
      return (
        <span className={cx(classes, styles.disabled)} aria-disabled="true" aria-label={opts.label}>
          {content}
        </span>
      );
    }
    if (getHref) {
      return (
        <a href={getHref(target)} className={classes} aria-label={opts.label} aria-current={opts.current ? 'page' : undefined}>
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        className={classes}
        aria-label={opts.label}
        aria-current={opts.current ? 'page' : undefined}
        onClick={onPageChange ? () => onPageChange(target) : undefined}
      >
        {content}
      </button>
    );
  };

  return (
    <nav aria-label={ariaLabel} className={cx(styles.root, styles[size], className)} {...props}>
      <ul className={styles.list}>
        <li>{renderControl(page - 1, <ChevronLeft />, { label: 'Предыдущая', disabled: page <= 1 })}</li>
        {getPageRange(page, pageCount, siblingCount).map((token) =>
          typeof token === 'number' ? (
            <li key={token}>{renderControl(token, token, { current: token === page, label: `Страница ${token}` })}</li>
          ) : (
            <li key={token} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
        <li>{renderControl(page + 1, <ChevronRight />, { label: 'Следующая', disabled: page >= pageCount })}</li>
      </ul>
    </nav>
  );
}
