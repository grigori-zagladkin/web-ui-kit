import type { Decorator, Preview } from '@storybook/react';
import '@fontsource-variable/inter';
import '../components/theme.css';
import { ThemeProvider } from '../components/ThemeProvider';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider forcedTheme={theme}>
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Тема',
      toolbar: {
        title: 'Тема',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Светлая' },
          { value: 'dark', title: 'Тёмная' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { expanded: true },
  },
};

export default preview;
