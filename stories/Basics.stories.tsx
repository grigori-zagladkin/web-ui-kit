import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Separator } from '../components/Separator';
import { Skeleton } from '../components/Skeleton';
import { Spinner } from '../components/Spinner';
import { Row, Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/Basics' };
export default meta;
type Story = StoryObj;

const avatarImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#a5b4fc"/><circle cx="32" cy="26" r="12" fill="#eef2ff"/><rect x="12" y="42" width="40" height="22" rx="11" fill="#eef2ff"/></svg>',
  );

export const Badges: Story = {
  render: () => (
    <Stack>
      <Section title="Soft">
        <Row gap={8}>
          <Badge>Черновик</Badge>
          <Badge variant="accent">Новое</Badge>
          <Badge variant="success" dot>Активен</Badge>
          <Badge variant="warning" dot>На проверке</Badge>
          <Badge variant="danger" dot>Ошибка</Badge>
        </Row>
      </Section>
      <Section title="Outline">
        <Row gap={8}>
          <Badge appearance="outline">Черновик</Badge>
          <Badge appearance="outline" variant="accent">Новое</Badge>
          <Badge appearance="outline" variant="success">Активен</Badge>
          <Badge appearance="outline" variant="warning">На проверке</Badge>
          <Badge appearance="outline" variant="danger">Ошибка</Badge>
        </Row>
      </Section>
    </Stack>
  ),
};

export const Avatars: Story = {
  render: () => (
    <Stack>
      <Row>
        <Avatar name="Анна Смирнова" size="xs" />
        <Avatar name="Анна Смирнова" size="sm" />
        <Avatar name="Анна Смирнова" size="md" />
        <Avatar name="Анна Смирнова" size="lg" />
      </Row>
      <Row>
        <Avatar name="Илья Петров" src={avatarImage} />
        <Avatar name="Илья Петров" src={avatarImage} shape="square" />
        <Avatar name="Мария" shape="square" />
      </Row>
    </Stack>
  ),
};

export const Loading: Story = {
  render: () => (
    <Stack>
      <Section title="Spinner">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Section>
      <Section title="Skeleton">
        <Row align="flex-start" wrap={false}>
          <Skeleton circle width={40} />
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Skeleton width="50%" height={14} />
            <div style={{ height: 10 }} />
            <Skeleton lines={3} />
          </div>
        </Row>
      </Section>
    </Stack>
  ),
};

export const Separators: Story = {
  render: () => (
    <Stack width={360}>
      <Separator />
      <Separator label="или" />
      <Row>
        <span>Файл</span>
        <Separator orientation="vertical" />
        <span>Правка</span>
        <Separator orientation="vertical" />
        <span>Вид</span>
      </Row>
    </Stack>
  ),
};
