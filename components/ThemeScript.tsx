export interface ThemeScriptProps {
  /** Должен совпадать со `storageKey` у `ThemeProvider`. */
  storageKey?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
  /** CSP nonce, если используется Content-Security-Policy. */
  nonce?: string;
}

/**
 * Серверный компонент. Ставит `data-theme` на `<html>` до первой отрисовки,
 * чтобы при SSR не было вспышки светлой темы. Размещается в `<head>`.
 * На `<html>` нужен `suppressHydrationWarning`, так как атрибут меняется до гидратации.
 */
export function ThemeScript({ storageKey = 'ui-theme', defaultTheme = 'system', nonce }: ThemeScriptProps) {
  const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(
    defaultTheme,
  )};if(t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />;
}
