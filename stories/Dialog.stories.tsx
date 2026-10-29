import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Field } from '../components/Field';
import { Input } from '../components/Input';
import { Stack } from './_layout';

const meta: Meta = { title: 'Components/Dialog' };
export default meta;
type Story = StoryObj;

const confirmFooter = (close: () => void) => (
  <>
    <Button onClick={close}>Отмена</Button>
    <Button variant="danger" onClick={close}>
      Удалить
    </Button>
  </>
);

export const Confirm: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <Dialog
      defaultOpen
      size="sm"
      title="Удалить проект?"
      description="Проект и все его задачи будут удалены без возможности восстановления."
      footer={confirmFooter}
    />
  ),
};

export const Form: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <Dialog
      defaultOpen
      title="Новый проект"
      description="Название можно изменить позже."
      footer={(close) => (
        <>
          <Button onClick={close}>Отмена</Button>
          <Button variant="primary" onClick={close}>
            Создать
          </Button>
        </>
      )}
    >
      <Stack gap={12}>
        <Field id="project-name" label="Название" required>
          <Input placeholder="Редизайн сайта" />
        </Field>
        <Field id="project-key" label="Ключ" hint="Используется в номерах задач">
          <Input placeholder="WEB" />
        </Field>
      </Stack>
    </Dialog>
  ),
};

export const WithTrigger: Story = {
  render: () => (
    <Dialog
      trigger={<Button variant="danger">Удалить проект</Button>}
      size="sm"
      title="Удалить проект?"
      description="Проект и все его задачи будут удалены."
      footer={confirmFooter}
    />
  ),
};
