import type { Meta, StoryObj } from '@storybook/react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { Row } from './_layout';

const meta: Meta = { title: 'Components/Tooltip' };
export default meta;
type Story = StoryObj;

export const Sides: Story = {
  render: () => (
    <div style={{ padding: '40px 80px' }}>
      <Row gap={96}>
        <Tooltip open content="Сверху" side="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip open content="Снизу" side="bottom">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip open content="Слева" side="left">
          <Button>Left</Button>
        </Tooltip>
        <Tooltip open content="Справа" side="right">
          <Button>Right</Button>
        </Tooltip>
      </Row>
    </div>
  ),
};

export const Hover: Story = {
  render: () => (
    <div style={{ padding: '48px 24px 8px' }}>
      <Tooltip id="tip-help" content="Подсказка появляется по наведению и фокусу">
        <Button icon={<HelpCircle />}>Наведи на меня</Button>
      </Tooltip>
    </div>
  ),
};
