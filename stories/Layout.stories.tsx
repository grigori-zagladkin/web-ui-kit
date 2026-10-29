import type { Meta, StoryObj } from '@storybook/react';
import { FolderPlus, MoreHorizontal, Plus } from 'lucide-react';
import { Accordion, AccordionItem } from '../components/Accordion';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { Progress } from '../components/Progress';
import { Row, Section, Stack } from './_layout';

const meta: Meta = { title: 'Components/Layout' };
export default meta;
type Story = StoryObj;

export const Cards: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 300px))', gap: 16 }}>
      <Card>
        <CardHeader
          title="Выручка"
          description="За последние 30 дней"
          action={<Button size="sm" variant="ghost" iconOnly icon={<MoreHorizontal />} aria-label="Ещё" />}
        />
        <CardBody>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>1 240 000 ₽</div>
          <Badge variant="success">+12,4%</Badge>
        </CardBody>
      </Card>
      <Card variant="elevated">
        <CardHeader title="Пригласить коллег" description="Они получат письмо со ссылкой" />
        <CardBody>Совместная работа доступна на тарифе Pro.</CardBody>
        <CardFooter>
          <Button size="sm">Позже</Button>
          <Button size="sm" variant="primary">Пригласить</Button>
        </CardFooter>
      </Card>
      <Card variant="subtle">
        <CardBody>Карточка без рамки — для вторичных блоков.</CardBody>
      </Card>
      <Card interactive>
        <CardBody>Кликабельная карточка с подсветкой при наведении.</CardBody>
      </Card>
    </div>
  ),
};

export const Alerts: Story = {
  render: () => (
    <Stack width={520} gap={10}>
      <Alert title="Обновление 2.4">Добавили экспорт отчётов в Excel.</Alert>
      <Alert variant="success" title="Изменения сохранены" />
      <Alert variant="warning" title="Подписка заканчивается через 3 дня" action={<Button size="sm">Продлить</Button>}>
        После окончания проекты станут доступны только для чтения.
      </Alert>
      <Alert variant="danger" title="Не удалось отправить отчёт">
        Сервер не ответил. Проверьте подключение и попробуйте ещё раз.
      </Alert>
    </Stack>
  ),
};

export const ProgressBars: Story = {
  render: () => (
    <Stack width={360}>
      <Progress label="Загрузка файлов" value={64} showValue />
      <Progress label="Хранилище" value={92} showValue variant="warning" />
      <Progress value={100} variant="success" size="sm" />
      <Progress label="Подготовка" />
    </Stack>
  ),
};

export const EmptyStates: Story = {
  render: () => (
    <Stack width={480}>
      <EmptyState
        bordered
        icon={<FolderPlus />}
        title="Создайте первый проект"
        description="В проектах хранятся задачи, документы и отчёты команды."
        action={
          <Button variant="primary" icon={<Plus />}>
            Создать проект
          </Button>
        }
      />
      <EmptyState size="sm" title="Ничего не найдено" description="Попробуйте изменить фильтры." />
    </Stack>
  ),
};

export const Navigation: Story = {
  render: () => (
    <Stack>
      <Section title="Breadcrumbs">
        <Breadcrumbs
          items={[{ label: 'Главная', href: '#' }, { label: 'Проекты', href: '#projects' }, { label: 'Редизайн сайта' }]}
        />
      </Section>
      <Section title="Pagination (кнопки)">
        <Pagination page={1} pageCount={5} />
        <Pagination page={6} pageCount={20} />
      </Section>
      <Section title="Pagination (ссылки, работает без JS)">
        <Row>
          <Pagination page={20} pageCount={20} size="sm" getHref={(p) => `?page=${p}`} />
        </Row>
      </Section>
    </Stack>
  ),
};

export const Accordions: Story = {
  render: () => (
    <Stack width={520} gap={24}>
      <Accordion>
        <AccordionItem title="Как изменить тариф?" open>
          Откройте «Настройки → Оплата» и выберите новый тариф. Разница пересчитается автоматически.
        </AccordionItem>
        <AccordionItem title="Можно ли вернуть деньги?">В течение 14 дней — без вопросов.</AccordionItem>
        <AccordionItem title="Где скачать счёт?">В разделе «Документы».</AccordionItem>
      </Accordion>
      <Accordion variant="bordered" exclusiveName="faq">
        <AccordionItem title="Открыт только один пункт" open>
          Атрибут name у details — браузер сам закрывает остальные.
        </AccordionItem>
        <AccordionItem title="Второй пункт">Содержимое второго пункта.</AccordionItem>
      </Accordion>
    </Stack>
  ),
};
