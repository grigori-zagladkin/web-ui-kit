import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Avatar.module.css';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Имя: из него берутся инициалы и alt. */
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
  return (first + second).toUpperCase();
}

/**
 * Картинка поверх инициалов: если картинка не загрузилась (alt пустой),
 * браузер ничего не рисует и видны инициалы. Работает без JS.
 */
export function Avatar({ src, name, size = 'md', shape = 'circle', className, ...props }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cx(styles.avatar, styles[size], styles[shape], className)}
      {...props}
    >
      <span className={styles.initials} aria-hidden="true">
        {getInitials(name)}
      </span>
      {src && <img className={styles.image} src={src} alt="" loading="lazy" decoding="async" />}
    </span>
  );
}
