import type { Meta, StoryObj } from '@storybook/react';
import { FileText } from 'lucide-react';
import { EditorViewer } from '../components/EditorViewer';
import { EmptyState } from '../components/EmptyState';
import { articleDoc, shortDoc } from './_content';
import { Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/EditorViewer' };
export default meta;
type Story = StoryObj;

export const Article: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <EditorViewer content={articleDoc} />
    </div>
  ),
};

export const WithTableOfContents: Story = {
  render: () => <EditorViewer content={articleDoc} toc />,
};

export const TocOnTop: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <EditorViewer content={articleDoc} toc={{ position: 'top', levels: [2] }} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={32}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Section key={size} title={`size="${size}"`}>
          <div style={{ maxWidth: 640 }}>
            <EditorViewer content={shortDoc} size={size} />
          </div>
        </Section>
      ))}
    </Stack>
  ),
};

export const Empty: Story = {
  render: () => (
    <EditorViewer
      content={{ type: 'doc', content: [{ type: 'paragraph' }] }}
      empty={<EmptyState bordered size="sm" icon={<FileText />} title="Описание пока не добавлено" />}
    />
  ),
};
