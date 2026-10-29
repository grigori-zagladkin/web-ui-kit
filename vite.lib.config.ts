import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import preserveDirectives from 'rollup-plugin-preserve-directives';

/**
 * Сборка npm-пакета: один JS-файл на модуль (tree-shaking у потребителя),
 * CSS компонента подключается из его JS, 'use client' сохраняется.
 */

// зависимости пакета не вшиваем — их ставит потребитель
const external = /^(react|react-dom|@tiptap|@tanstack|lucide-react)(\/|$)/;

/** theme.css — не CSS Module, а глобальные токены: кладём в dist как есть. */
function copyThemeCss(): Plugin {
  return {
    name: 'copy-theme-css',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'theme.css',
        source: readFileSync(resolve(__dirname, 'components/theme.css'), 'utf8'),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      include: ['components', 'utils', 'global.d.ts'],
      exclude: ['stories', 'tests', '**/*.stories.tsx'],
      entryRoot: '.',
    }),
    copyThemeCss(),
  ],
  css: {
    modules: {
      // префикс, чтобы классы кита не пересекались со стилями приложения
      generateScopedName: 'ui-[local]-[hash:base64:5]',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssCodeSplit: true,
    lib: {
      entry: {
        'components/index': resolve(__dirname, 'components/index.ts'),
        'utils/index': resolve(__dirname, 'utils/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => external.test(id),
      plugins: [preserveDirectives()],
      output: {
        preserveModules: true,
        preserveModulesRoot: '.',
        entryFileNames: '[name].js',
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? '[name][extname]' : 'assets/[name][extname]',
      },
      onwarn(warning, warn) {
        // директивы обрабатывает preserveDirectives — штатное предупреждение Rollup не нужно
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
});
