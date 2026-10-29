import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cx } from '../utils/cx';
import { dataAttr } from '../utils/dom';
import { Slot } from '../utils/Slot';
import { Spinner } from './Spinner';
import styles from './Button.module.css';

type AnchorProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel' | 'download' | 'hrefLang'>;

interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, AnchorProps {
  /**
   * `link` — текстовая ссылка с подчёркиванием, `link-muted` — тихая ссылка (подчёркивание при наведении).
   * Остальные — кнопки; с `href` они тоже рендерятся как `<a>`.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'link-muted';
  size?: 'sm' | 'md' | 'lg';
  /** Показывает спиннер и блокирует кнопку. */
  loading?: boolean;
  /** Иконка слева от текста (или единственная при `iconOnly`). */
  icon?: ReactNode;
  /** Иконка справа от текста. */
  iconRight?: ReactNode;
  fullWidth?: boolean;
  /** Для ссылок: открыть в новой вкладке с безопасным `rel` и иконкой ↗. */
  external?: boolean;
  /**
   * Отрисовать стили на дочернем элементе, например на `next/link`:
   * `<Button asChild variant="link"><NextLink href="/">…</NextLink></Button>`. Иконки и loading не добавляются.
   */
  asChild?: boolean;
}

interface ButtonWithTextProps extends ButtonBaseProps {
  iconOnly?: false;
  children: ReactNode;
}

interface ButtonIconOnlyProps extends ButtonBaseProps {
  /** Квадратная кнопка только с иконкой. Подпись для скринридеров обязательна. */
  iconOnly: true;
  icon: ReactNode;
  'aria-label': string;
  children?: never;
}

export type ButtonProps = ButtonWithTextProps | ButtonIconOnlyProps;

/**
 * Кнопка и ссылка в одном компоненте. С `href` рендерится `<a>`, без — `<button>`.
 * `variant="link"` даёт вид текстовой ссылки (бывший Link).
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    iconOnly = false,
    fullWidth = false,
    external = false,
    asChild = false,
    disabled,
    type = 'button',
    href,
    target,
    rel,
    className,
    children,
    ...props
  },
  ref,
) {
  const isLink = variant === 'link' || variant === 'link-muted';
  const classes = cx(
    styles.button,
    styles[variant],
    !isLink && styles[size],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className,
  );

  if (asChild) {
    return (
      <Slot className={classes} data-variant={variant} {...props}>
        {children}
      </Slot>
    );
  }

  const content = (
    <>
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} aria-hidden="true" role={undefined} aria-label={undefined} />
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {!iconOnly && children !== undefined && <span className={styles.label}>{children}</span>}
      {!iconOnly && iconRight && (
        <span className={styles.icon} aria-hidden="true">
          {iconRight}
        </span>
      )}
      {!iconOnly && external && <ArrowUpRight className={styles.externalIcon} aria-hidden="true" />}
    </>
  );

  if (href !== undefined) {
    const inactive = disabled || loading;
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        // у недоступной ссылки убираем href: так она не кликается и выпадает из Tab-порядка
        href={inactive ? undefined : href}
        target={external ? '_blank' : target}
        rel={external ? 'noopener noreferrer' : rel}
        aria-disabled={inactive || undefined}
        aria-busy={loading || undefined}
        data-loading={dataAttr(loading)}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={dataAttr(loading)}
      {...props}
    >
      {content}
    </button>
  );
});
