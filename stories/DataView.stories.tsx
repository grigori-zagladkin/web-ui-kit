import type { Meta, StoryObj } from '@storybook/react';
import { Download, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { DataView, type DataViewColumn } from '../components/DataView';

const meta: Meta = { title: 'Components/DataView' };
export default meta;
type Story = StoryObj;

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'vacation' | 'fired';
  salary: number;
  hiredAt: Date;
  reports?: Employee[];
}

const employees: Employee[] = [
  { id: '1', name: 'Анна Смирнова', email: 'anna@company.ru', department: 'Дизайн', role: 'Арт-директор', status: 'active', salary: 320000, hiredAt: new Date(2019, 2, 11) },
  { id: '2', name: 'Илья Петров', email: 'ilya@company.ru', department: 'Разработка', role: 'Тимлид', status: 'active', salary: 380000, hiredAt: new Date(2018, 8, 3) },
  { id: '3', name: 'Мария Кузнецова', email: 'maria@company.ru', department: 'Разработка', role: 'Frontend', status: 'vacation', salary: 260000, hiredAt: new Date(2021, 0, 19) },
  { id: '4', name: 'Дмитрий Орлов', email: 'dmitry@company.ru', department: 'Продажи', role: 'Менеджер', status: 'active', salary: 180000, hiredAt: new Date(2022, 5, 1) },
  { id: '5', name: 'Елена Волкова', email: 'elena@company.ru', department: 'Дизайн', role: 'Продуктовый дизайнер', status: 'active', salary: 240000, hiredAt: new Date(2020, 10, 23) },
  { id: '6', name: 'Сергей Морозов', email: 'sergey@company.ru', department: 'Разработка', role: 'Backend', status: 'fired', salary: 270000, hiredAt: new Date(2017, 3, 14) },
  { id: '7', name: 'Ольга Лебедева', email: 'olga@company.ru', department: 'Маркетинг', role: 'Контент', status: 'active', salary: 150000, hiredAt: new Date(2023, 1, 6) },
  { id: '8', name: 'Павел Соколов', email: 'pavel@company.ru', department: 'Продажи', role: 'Руководитель', status: 'vacation', salary: 300000, hiredAt: new Date(2016, 6, 28) },
];

const statusBadge = {
  active: <Badge variant="success" dot>Работает</Badge>,
  vacation: <Badge variant="warning" dot>В отпуске</Badge>,
  fired: <Badge>Уволен</Badge>,
};

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const columns: DataViewColumn<Employee>[] = [
  {
    id: 'name',
    header: 'Сотрудник',
    accessor: 'name',
    width: 240,
    sticky: 'left',
    hideable: false,
    cell: ({ row }) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={row.name} size="sm" />
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0 }}>
          <span style={{ fontWeight: 500 }}>{row.name}</span>
          <span style={{ color: 'var(--ui-fg-muted)', fontSize: 12 }}>{row.email}</span>
        </span>
      </span>
    ),
  },
  { id: 'department', header: 'Отдел', accessor: 'department', width: 140, groupable: true },
  { id: 'role', header: 'Должность', accessor: 'role', width: 190 },
  {
    id: 'status',
    header: 'Статус',
    accessor: 'status',
    width: 130,
    groupable: true,
    cell: ({ row }) => statusBadge[row.status],
  },
  { id: 'salary', header: 'Зарплата', accessor: 'salary', width: 140, align: 'right', cell: ({ value }) => money.format(value as number) },
  { id: 'hiredAt', header: 'Дата найма', accessor: 'hiredAt', width: 130, align: 'right', searchable: false },
  {
    id: 'actions',
    header: '',
    width: 56,
    sticky: 'right',
    hideable: false,
    cell: () => <Button size="sm" variant="ghost" iconOnly icon={<MoreHorizontal />} aria-label="Действия" />,
  },
];

export const Table: Story = {
  render: () => (
    <DataView
      aria-label="Сотрудники"
      data={employees}
      columns={columns}
      getRowId={(row) => row.id}
      searchable
      showColumnSettings
      enableColumnResize
      toolbar={<Button size="sm" icon={<Download />}>Экспорт</Button>}
    />
  ),
};

export const SelectionAndDetails: Story = {
  render: () => (
    <DataView
      aria-label="Сотрудники"
      data={employees.slice(0, 5)}
      columns={columns.filter((c) => c.id !== 'actions')}
      getRowId={(row) => row.id}
      selectionMode="multiple"
      defaultRowSelection={{ '2': true, '3': true }}
      defaultExpanded={{ '2': true }}
      renderExpanded={(row) => (
        <div style={{ display: 'flex', gap: 32, fontSize: 13 }}>
          <span>Отдел: {row.department}</span>
          <span>В компании с {row.hiredAt.toLocaleDateString('ru-RU')}</span>
        </div>
      )}
    />
  ),
};

export const Grouped: Story = {
  render: () => (
    <DataView
      aria-label="Сотрудники по отделам"
      data={employees}
      columns={columns.filter((c) => c.id !== 'actions')}
      getRowId={(row) => row.id}
      defaultGrouping={['department']}
      defaultExpanded={true}
      density="compact"
    />
  ),
};

const tree: Employee[] = [
  {
    ...employees[1]!,
    reports: [employees[2]!, { ...employees[5]!, reports: [employees[6]!] }],
  },
  { ...employees[7]!, reports: [employees[3]!] },
];

export const Tree: Story = {
  render: () => (
    <DataView
      aria-label="Структура"
      data={tree}
      columns={columns.filter((c) => ['name', 'role', 'department'].includes(c.id)).map((c) => ({ ...c, sticky: undefined }))}
      getRowId={(row) => row.id}
      getSubRows={(row) => row.reports}
      defaultExpanded={true}
    />
  ),
};

export const ListView: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DataView
        aria-label="Сотрудники"
        view="list"
        data={employees.slice(0, 5)}
        columns={columns}
        getRowId={(row) => row.id}
        selectionMode="multiple"
        searchable
        renderItem={(row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={row.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{row.name}</div>
              <div style={{ color: 'var(--ui-fg-muted)', fontSize: 13 }}>
                {row.role} · {row.department}
              </div>
            </div>
            {statusBadge[row.status]}
          </div>
        )}
      />
    </div>
  ),
};

export const Paginated: Story = {
  render: () => (
    <DataView
      aria-label="Сотрудники"
      data={[...employees, ...employees.map((e) => ({ ...e, id: `${e.id}-b` }))]}
      columns={columns.filter((c) => c.id !== 'actions')}
      getRowId={(row) => row.id}
      pageSize={5}
      density="compact"
    />
  ),
};

export const Loading: Story = {
  render: () => <DataView aria-label="Сотрудники" data={[]} columns={columns} loading />,
};

export const Empty: Story = {
  render: () => <DataView aria-label="Сотрудники" data={[]} columns={columns} searchable />,
};

export const ErrorState: Story = {
  render: () => <DataView aria-label="Сотрудники" data={[]} columns={columns} error="Сервер вернул ошибку 500. Попробуйте обновить страницу." />,
};
