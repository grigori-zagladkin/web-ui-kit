'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { cx } from '../utils/cx';
import styles from './Toast.module.css';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** мс до автозакрытия; `Infinity` — не закрывать. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  id?: string;
}

type ToastRecord = ToastOptions & { id: string; variant: ToastVariant; duration: number };

// Глобальное хранилище: toast() можно вызвать откуда угодно, без провайдера и контекста
let toasts: ToastRecord[] = [];
const listeners = new Set<() => void>();
const EMPTY: ToastRecord[] = [];
let counter = 0;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dismissToast(id?: string) {
  toasts = id ? toasts.filter((t) => t.id !== id) : [];
  emit();
}

function show(options: ToastOptions): string {
  const id = options.id ?? `toast-${++counter}`;
  const record: ToastRecord = { variant: 'default', duration: 5000, ...options, id };
  toasts = [...toasts.filter((t) => t.id !== id), record];
  emit();
  return id;
}

/** Показать уведомление. Нужен один `<Toaster />` в корне приложения. */
export const toast = Object.assign(show, {
  success: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    show({ ...options, title, variant: 'success' }),
  warning: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    show({ ...options, title, variant: 'warning' }),
  error: (title: ReactNode, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    show({ ...options, title, variant: 'danger' }),
  dismiss: dismissToast,
});

const icons: Record<ToastVariant, ReactNode> = {
  default: <Info />,
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  danger: <CircleAlert />,
};

function ToastItem({ record }: { record: ToastRecord }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const start = () => {
    if (!Number.isFinite(record.duration)) return;
    timer.current = setTimeout(() => dismissToast(record.id), record.duration);
  };
  const stop = () => clearTimeout(timer.current);

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id, record.duration]);

  return (
    <li
      className={cx(styles.toast, styles[record.variant])}
      role={record.variant === 'danger' ? 'alert' : 'status'}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[record.variant]}
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{record.title}</p>
        {record.description && <p className={styles.description}>{record.description}</p>}
      </div>
      {record.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            record.action?.onClick();
            dismissToast(record.id);
          }}
        >
          {record.action.label}
        </button>
      )}
      <button type="button" className={styles.close} aria-label="Закрыть" onClick={() => dismissToast(record.id)}>
        <X aria-hidden="true" />
      </button>
    </li>
  );
}

export interface ToasterProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  /** Сколько уведомлений показывать одновременно. */
  limit?: number;
  className?: string;
}

/** Контейнер уведомлений. Разместите один раз в корневом layout. */
export function Toaster({ position = 'bottom-right', limit = 5, className }: ToasterProps) {
  const list = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  const visible = list.slice(-limit);

  return (
    <section aria-label="Уведомления" className={cx(styles.viewport, styles[position], className)}>
      <ol className={styles.list}>
        {visible.map((record) => (
          <ToastItem key={record.id} record={record} />
        ))}
      </ol>
    </section>
  );
}
