'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cx } from '../utils/cx';
import { Button } from './Button';
import styles from './CopyButton.module.css';

export interface CopyButtonProps {
  /** Текст, который попадёт в буфер обмена. */
  text: string;
  label?: string;
  copiedLabel?: string;
  /** Показать подпись рядом с иконкой. */
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/** Кнопка «Скопировать» с подтверждением. Маленький клиентский островок для серверных компонентов. */
export function CopyButton({
  text,
  label = 'Скопировать',
  copiedLabel = 'Скопировано',
  showLabel = false,
  size = 'sm',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // буфер обмена недоступен (нет https или запрещено) — молча ничего не делаем
    }
  };

  const current = copied ? copiedLabel : label;
  const icon = copied ? <Check /> : <Copy />;

  return (
    <span className={cx(styles.root, copied && styles.copied, className)}>
      {showLabel ? (
        <Button size={size} variant="ghost" icon={icon} onClick={copy}>
          {current}
        </Button>
      ) : (
        <Button size={size} variant="ghost" iconOnly icon={icon} aria-label={current} title={current} onClick={copy} />
      )}
      <span className={styles.live} aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}
