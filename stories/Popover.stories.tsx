import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { Input } from '../components/Input';
import { Popover } from '../components/Popover';
import { Row, Stack } from './_layout';

const meta: Meta = { title: 'Components/Popover' };
export default meta;
type Story = StoryObj;

export const Open: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <div style={{ height: 220 }}>
      <Popover defaultOpen trigger={<Button>Переименовать</Button>}>
        {({ close }) => (
          <Stack gap={10}>
            <Field id="rename" label="Название">
              <Input size="sm" defaultValue="Отчёт за квартал" />
            </Field>
            <Row gap={6}>
              <Button size="sm" onClick={close}>
                Отмена
              </Button>
              <Button size="sm" variant="primary" onClick={close}>
                Сохранить
              </Button>
            </Row>
          </Stack>
        )}
      </Popover>
    </div>
  ),
};

export const PlacementEnd: Story = {
  tags: ['visual-viewport'],
  render: () => (
    <div style={{ height: 160, display: 'flex', justifyContent: 'flex-end' }}>
      <Popover defaultOpen placement="bottom-end" trigger={<Button>Справа</Button>}>
        Выравнивание по правому краю триггера.
      </Popover>
    </div>
  ),
};
