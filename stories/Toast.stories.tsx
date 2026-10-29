import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';
import { toast, Toaster } from '../components/Toast';
import { Row } from './_layout';

const meta: Meta = { title: 'Components/Toast' };
export default meta;
type Story = StoryObj;

function ToastDemo() {
  useEffect(() => {
    toast.dismiss();
    toast({ title: 'Черновик сохранён', duration: Infinity });
    toast.success('Отчёт отправлен', { description: 'Получатели увидят его в течение минуты.', duration: Infinity });
    toast.warning('Медленное соединение', { duration: Infinity });
    toast.error('Не удалось загрузить файл', {
      description: 'Размер больше 20 МБ.',
      action: { label: 'Повторить', onClick: () => undefined },
      duration: Infinity,
    });
  }, []);
  return <Toaster position="bottom-right" />;
}

export const Variants: Story = {
  tags: ['visual-viewport'],
  render: () => <ToastDemo />,
};

export const Playground: Story = {
  tags: ['no-visual'],
  render: () => (
    <>
      <Row>
        <Button onClick={() => toast({ title: 'Обычное уведомление' })}>Default</Button>
        <Button onClick={() => toast.success('Сохранено')}>Success</Button>
        <Button onClick={() => toast.error('Ошибка', { description: 'Что-то пошло не так.' })}>Error</Button>
      </Row>
      <Toaster />
    </>
  ),
};
