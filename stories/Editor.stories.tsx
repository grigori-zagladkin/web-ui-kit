import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '../components/Editor';
import { EditorViewer, type JSONContent } from '../components/EditorViewer';
import { Field } from '../components/Field';
import { shortDoc } from './_content';

const meta: Meta = { title: 'Components/Editor' };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <Editor defaultValue={shortDoc} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <Editor placeholder="Опишите задачу…" maxLength={500} />
    </div>
  ),
};

export const InField: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <Field id="description" label="Описание" error="Описание обязательно">
        <Editor invalid toolbar={false} minHeight={96} />
      </Field>
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <Editor defaultValue={shortDoc} editable={false} />
    </div>
  ),
};

function EditAndPreview() {
  const [value, setValue] = useState<JSONContent>(shortDoc);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Editor value={value} onChange={setValue} />
      <EditorViewer content={value} size="sm" />
    </div>
  );
}

/** Редактор и вьювер рядом: правки сразу видны в превью. */
export const WithPreview: Story = {
  tags: ['no-visual'],
  render: () => <EditAndPreview />,
};
