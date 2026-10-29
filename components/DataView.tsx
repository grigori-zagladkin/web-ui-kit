'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnSizingState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Inbox,
  RotateCcw,
  Search,
  Settings2,
} from 'lucide-react';
import { cx } from '../utils/cx';
import { useControllableState } from '../utils/useControllableState';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DropdownMenu } from './DropdownMenu';
import { EmptyState } from './EmptyState';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { Popover } from './Popover';
import { Skeleton } from './Skeleton';
import styles from './DataView.module.css';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'center' | 'right';
    label?: ReactNode;
    /** Служебная колонка (выбор, раскрытие) — не показывается в настройках. */
    system?: boolean;
  }
}

export interface DataViewColumn<T> {
  id: string;
  header: ReactNode;
  /** Ключ объекта или функция. Без accessor колонка только отображает `cell`. */
  accessor?: keyof T | ((row: T) => unknown);
  /** Свой рендер ячейки. По умолчанию — значение accessor как текст. */
  cell?: (ctx: { row: T; value: unknown; index: number }) => ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  /** По умолчанию true, если есть accessor. */
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  /** Участвует в глобальном поиске. По умолчанию true, если есть accessor. */
  searchable?: boolean;
  /** Можно скрыть в настройках колонок. По умолчанию true. */
  hideable?: boolean;
  /** Закрепить колонку при горизонтальной прокрутке. */
  sticky?: 'left' | 'right';
  /** Можно группировать по этой колонке. */
  groupable?: boolean;
}

export interface DataViewItemContext {
  index: number;
  selected: boolean;
  toggleSelected: () => void;
}

export interface DataViewProps<T> {
  data: T[];
  columns: DataViewColumn<T>[];
  /** Стабильный id строки — важен для выделения и раскрытия. По умолчанию индекс. */
  getRowId?: (row: T, index: number) => string;

  /** `table` — таблица, `list` — список карточек/строк с тем же состоянием. */
  view?: 'table' | 'list';
  /** Рендер элемента в режиме `list`. */
  renderItem?: (row: T, ctx: DataViewItemContext) => ReactNode;
  density?: 'compact' | 'default' | 'comfortable';

  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  /** Сортировка на сервере: компонент только сообщает `onSortingChange`, данные не сортирует. */
  manualSorting?: boolean;

  /** Показать поле поиска в тулбаре. */
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  /** Поиск на сервере. */
  manualFiltering?: boolean;

  selectionMode?: 'none' | 'single' | 'multiple';
  rowSelection?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  /** Вложенные строки (дерево). */
  getSubRows?: (row: T) => T[] | undefined;
  /** Панель с деталями под строкой. */
  renderExpanded?: (row: T) => ReactNode;
  expanded?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;

  /** id колонок для группировки. */
  grouping?: GroupingState;
  defaultGrouping?: GroupingState;
  onGroupingChange?: (grouping: GroupingState) => void;

  /** Настройки колонок: передайте сохранённые значения в default*, сохраняйте из on*Change. */
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  columnOrder?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  columnSizing?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  /** Тянуть границу заголовка, чтобы менять ширину. */
  enableColumnResize?: boolean;
  /** Кнопка «Колонки» в тулбаре: видимость и порядок. */
  showColumnSettings?: boolean;

  /** Включает пагинацию с этим размером страницы. */
  pageSize?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Пагинация на сервере: `data` — текущая страница, `rowCount` — всего строк. */
  manualPagination?: boolean;
  rowCount?: number;

  loading?: boolean;
  error?: ReactNode;
  /** Своё пустое состояние. */
  empty?: ReactNode;
  /** Дополнительные элементы тулбара справа. */
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Ограничить высоту и закрепить заголовок. */
  maxHeight?: CSSProperties['maxHeight'];
  className?: string;
  'aria-label'?: string;
}

const SELECT_ID = '__select';
const EXPAND_ID = '__expand';

function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return <span className={styles.muted}>—</span>;
  if (value instanceof Date) return value.toLocaleDateString('ru-RU');
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  return String(value);
}

function stickyStyle<T>(column: Column<T, unknown>): CSSProperties | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  return pinned === 'left' ? { left: column.getStart('left') } : { right: column.getAfter('right') };
}

export function DataView<T>({
  data,
  columns,
  getRowId,
  view = 'table',
  renderItem,
  density = 'default',
  sorting: sortingProp,
  defaultSorting = [],
  onSortingChange,
  manualSorting = false,
  searchable = false,
  searchPlaceholder = 'Поиск',
  globalFilter: globalFilterProp,
  defaultGlobalFilter = '',
  onGlobalFilterChange,
  manualFiltering = false,
  selectionMode = 'none',
  rowSelection: rowSelectionProp,
  defaultRowSelection = {},
  onRowSelectionChange,
  getSubRows,
  renderExpanded,
  expanded: expandedProp,
  defaultExpanded = {},
  onExpandedChange,
  grouping: groupingProp,
  defaultGrouping = [],
  onGroupingChange,
  columnVisibility: visibilityProp,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  columnOrder: orderProp,
  defaultColumnOrder = [],
  onColumnOrderChange,
  columnSizing: sizingProp,
  defaultColumnSizing = {},
  onColumnSizingChange,
  enableColumnResize = false,
  showColumnSettings = false,
  pageSize,
  pagination: paginationProp,
  onPaginationChange,
  manualPagination = false,
  rowCount,
  loading = false,
  error,
  empty,
  toolbar,
  onRowClick,
  maxHeight,
  className,
  'aria-label': ariaLabel,
}: DataViewProps<T>) {
  const [sorting, setSorting] = useControllableState({ value: sortingProp, defaultValue: defaultSorting, onChange: onSortingChange });
  const [globalFilter, setGlobalFilter] = useControllableState({
    value: globalFilterProp,
    defaultValue: defaultGlobalFilter,
    onChange: onGlobalFilterChange,
  });
  const [rowSelection, setRowSelection] = useControllableState({
    value: rowSelectionProp,
    defaultValue: defaultRowSelection,
    onChange: onRowSelectionChange,
  });
  const [expanded, setExpanded] = useControllableState({ value: expandedProp, defaultValue: defaultExpanded, onChange: onExpandedChange });
  const [grouping, setGrouping] = useControllableState({ value: groupingProp, defaultValue: defaultGrouping, onChange: onGroupingChange });
  const [columnVisibility, setColumnVisibility] = useControllableState({
    value: visibilityProp,
    defaultValue: defaultColumnVisibility,
    onChange: onColumnVisibilityChange,
  });
  const [columnOrder, setColumnOrder] = useControllableState({ value: orderProp, defaultValue: defaultColumnOrder, onChange: onColumnOrderChange });
  const [columnSizing, setColumnSizing] = useControllableState({ value: sizingProp, defaultValue: defaultColumnSizing, onChange: onColumnSizingChange });
  const [pagination, setPagination] = useControllableState<PaginationState>({
    value: paginationProp,
    defaultValue: { pageIndex: 0, pageSize: pageSize ?? 20 },
    onChange: onPaginationChange,
  });

  const selectable = selectionMode !== 'none';
  const expandable = Boolean(getSubRows || renderExpanded);
  const paginated = pageSize !== undefined || paginationProp !== undefined;

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = columns.map((col) => {
      const accessorFn =
        col.accessor === undefined
          ? undefined
          : typeof col.accessor === 'function'
            ? (col.accessor as (row: T) => unknown)
            : (row: T) => row[col.accessor as keyof T];
      const sortFn = col.sortFn;
      return {
        id: col.id,
        accessorFn,
        header: () => col.header,
        cell: (ctx) =>
          col.cell ? col.cell({ row: ctx.row.original, value: ctx.getValue(), index: ctx.row.index }) : formatValue(ctx.getValue()),
        size: col.width ?? 160,
        minSize: col.minWidth ?? 60,
        maxSize: col.maxWidth ?? 1000,
        enableSorting: col.sortable ?? accessorFn !== undefined,
        sortingFn: sortFn ? (a: Row<T>, b: Row<T>) => sortFn(a.original, b.original) : 'auto',
        enableGlobalFilter: col.searchable ?? accessorFn !== undefined,
        enableHiding: col.hideable ?? true,
        enableGrouping: col.groupable ?? false,
        meta: { align: col.align, label: col.header },
      } as ColumnDef<T>;
    });

    const leading: ColumnDef<T>[] = [];
    if (selectable) {
      leading.push({
        id: SELECT_ID,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        meta: { system: true },
        header: ({ table }) =>
          selectionMode === 'multiple' ? (
            <Checkbox
              aria-label="Выбрать все строки"
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          ) : null,
        cell: ({ row }) => (
          <Checkbox
            aria-label="Выбрать строку"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      });
    }
    if (expandable) {
      leading.push({
        id: EXPAND_ID,
        size: 36,
        minSize: 36,
        maxSize: 36,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        meta: { system: true },
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              type="button"
              className={styles.expander}
              aria-label={row.getIsExpanded() ? 'Свернуть' : 'Развернуть'}
              aria-expanded={row.getIsExpanded()}
              onClick={(event) => {
                event.stopPropagation();
                row.toggleExpanded();
              }}
            >
              {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
            </button>
          ) : null,
      });
    }
    return [...leading, ...defs];
  }, [columns, selectable, selectionMode, expandable]);

  const columnPinning = useMemo(() => {
    const left = columns.filter((c) => c.sticky === 'left').map((c) => c.id);
    const right = columns.filter((c) => c.sticky === 'right').map((c) => c.id);
    const system = [selectable && SELECT_ID, expandable && EXPAND_ID].filter(Boolean) as string[];
    return { left: left.length ? [...system, ...left] : [], right };
  }, [columns, selectable, expandable]);

  const table = useReactTable<T>({
    data,
    columns: tableColumns,
    getRowId,
    getSubRows,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      expanded,
      grouping,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      ...(paginated ? { pagination } : null),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (updater) =>
      setGlobalFilter((prev) => String(typeof updater === 'function' ? updater(prev) : (updater ?? ''))),
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGroupingChange: setGrouping,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
    enableRowSelection: selectable,
    enableMultiRowSelection: selectionMode === 'multiple',
    enableSubRowSelection: selectionMode === 'multiple',
    getRowCanExpand: renderExpanded ? () => true : (row) => (row.subRows?.length ?? 0) > 0,
    enableColumnResizing: enableColumnResize,
    columnResizeMode: 'onChange',
    groupedColumnMode: false,
    // первый клик — всегда по возрастанию, в том числе для чисел и дат
    sortDescFirst: false,
    manualSorting,
    manualFiltering,
    manualPagination,
    rowCount,
    getColumnCanGlobalFilter: (column) => column.columnDef.enableGlobalFilter !== false && Boolean(column.accessorFn),
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    ...(paginated ? { getPaginationRowModel: getPaginationRowModel() } : null),
  });

  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const selectedCount = Object.keys(rowSelection).filter((id) => rowSelection[id]).length;
  const dataColumns = table.getAllLeafColumns().filter((column) => !column.columnDef.meta?.system);
  const firstDataColumnId = table.getVisibleLeafColumns().find((c) => !c.columnDef.meta?.system)?.id;
  const sortableColumns = dataColumns.filter((column) => column.getCanSort());

  const showToolbar =
    searchable || showColumnSettings || Boolean(toolbar) || selectedCount > 0 || (view === 'list' && sortableColumns.length > 0);

  const toolbarNode = showToolbar && (
    <div className={styles.toolbar}>
      {searchable && (
        <Input
          size="sm"
          type="search"
          wrapperClassName={styles.search}
          leading={<Search />}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
        />
      )}
      {selectedCount > 0 && <span className={styles.selectedCount}>Выбрано: {selectedCount}</span>}
      <div className={styles.toolbarEnd}>
        {toolbar}
        {view === 'list' && sortableColumns.length > 0 && (
          <DropdownMenu
            aria-label="Сортировка"
            placement="bottom-end"
            trigger={
              <Button size="sm" variant="secondary" icon={<ArrowUpDown />}>
                Сортировка
              </Button>
            }
            items={sortableColumns.map((column) => {
              const dir = column.getIsSorted();
              return {
                type: 'item' as const,
                label: column.columnDef.meta?.label,
                icon: dir === 'asc' ? <ArrowUp /> : dir === 'desc' ? <ArrowDown /> : undefined,
                onSelect: () => column.toggleSorting(dir === 'asc'),
              };
            })}
          />
        )}
        {showColumnSettings && (
          <ColumnSettings
            columns={dataColumns}
            // служебные колонки (выбор, раскрытие) всегда впереди
            onOrderChange={(ids) => table.setColumnOrder([SELECT_ID, EXPAND_ID, ...ids])}
            onReset={() => {
              table.resetColumnOrder(true);
              table.resetColumnVisibility(true);
              table.resetColumnSizing(true);
            }}
          />
        )}
      </div>
    </div>
  );

  const emptyNode = error ? (
    <EmptyState size="sm" title="Не удалось загрузить данные" description={error} />
  ) : (
    (empty ?? <EmptyState size="sm" icon={<Inbox />} title="Ничего не найдено" description={globalFilter ? 'Попробуйте изменить запрос.' : undefined} />)
  );

  const paginationNode = paginated && table.getPageCount() > 1 && (
    <div className={styles.footer}>
      <span className={styles.muted}>
        {manualPagination && rowCount !== undefined ? `Всего: ${rowCount}` : `Всего: ${table.getPrePaginationRowModel().rows.length}`}
      </span>
      <Pagination
        size="sm"
        page={table.getState().pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </div>
  );

  if (view === 'list') {
    return (
      <div className={cx(styles.root, styles[density], className)}>
        {toolbarNode}
        <div className={styles.listScroll} style={{ maxHeight }}>
          {loading ? (
            <ul className={styles.list} aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={i} className={styles.listItem}>
                  <Skeleton width="40%" />
                  <Skeleton width="70%" height="0.8em" />
                </li>
              ))}
            </ul>
          ) : rows.length === 0 || error ? (
            emptyNode
          ) : (
            <ul className={styles.list} aria-label={ariaLabel}>
              {rows.map((row) => {
                const ctx: DataViewItemContext = {
                  index: row.index,
                  selected: row.getIsSelected(),
                  toggleSelected: () => row.toggleSelected(),
                };
                return (
                  <li
                    key={row.id}
                    className={cx(styles.listItem, onRowClick && styles.clickable)}
                    data-selected={ctx.selected || undefined}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    style={{ paddingLeft: row.depth ? `${row.depth * 20 + 12}px` : undefined }}
                  >
                    {selectable && (
                      <Checkbox
                        aria-label="Выбрать"
                        checked={ctx.selected}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(event) => event.stopPropagation()}
                      />
                    )}
                    <div className={styles.listContent}>
                      {renderItem ? renderItem(row.original, ctx) : <DefaultListItem row={row} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {paginationNode}
      </div>
    );
  }

  return (
    <div className={cx(styles.root, styles[density], className)}>
      {toolbarNode}
      <div className={styles.tableScroll} style={{ maxHeight }}>
        <table
          className={styles.table}
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
          style={{ width: table.getTotalSize(), minWidth: '100%' }}
        >
          <thead className={cx(maxHeight !== undefined && styles.stickyHeader)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  const sorted = column.getIsSorted();
                  const align = column.columnDef.meta?.align ?? 'left';
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      colSpan={header.colSpan}
                      className={cx(styles.th, styles[`align-${align}`], column.getIsPinned() && styles.pinned)}
                      style={{ width: header.getSize(), ...stickyStyle(column) }}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                    >
                      {header.isPlaceholder ? null : column.getCanSort() ? (
                        <button type="button" className={styles.sortButton} onClick={column.getToggleSortingHandler()}>
                          {flexRender(column.columnDef.header, header.getContext())}
                          <span className={cx(styles.sortIcon, sorted && styles.sortActive)} aria-hidden="true">
                            {sorted === 'asc' ? <ArrowUp /> : sorted === 'desc' ? <ArrowDown /> : <ArrowUpDown />}
                          </span>
                        </button>
                      ) : (
                        flexRender(column.columnDef.header, header.getContext())
                      )}
                      {enableColumnResize && column.getCanResize() && (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label="Изменить ширину колонки"
                          className={cx(styles.resizer, column.getIsResizing() && styles.resizing)}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onDoubleClick={() => column.resetSize()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className={styles.tr}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <td key={column.id} className={styles.td}>
                      {!column.columnDef.meta?.system && <Skeleton width={`${50 + ((i * 17 + column.getIndex() * 23) % 40)}%`} />}
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 || error ? (
              <tr>
                <td colSpan={visibleColumnCount} className={styles.emptyCell}>
                  {emptyNode}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                if (row.getIsGrouped()) {
                  const groupColumn = table.getColumn(row.groupingColumnId ?? '');
                  return (
                    <tr key={row.id} className={styles.groupRow}>
                      <td colSpan={visibleColumnCount} className={styles.td} style={{ paddingLeft: `${row.depth * 20 + 12}px` }}>
                        <button type="button" className={styles.groupToggle} onClick={row.getToggleExpandedHandler()} aria-expanded={row.getIsExpanded()}>
                          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
                          <span className={styles.muted}>{groupColumn?.columnDef.meta?.label}:</span>
                          <strong>{formatValue(row.groupingValue)}</strong>
                          <span className={styles.groupCount}>{row.subRows.length}</span>
                        </button>
                      </td>
                    </tr>
                  );
                }
                const selected = row.getIsSelected();
                return (
                  <FragmentRow
                    key={row.id}
                    row={row}
                    selected={selected}
                    clickable={Boolean(onRowClick)}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    firstDataColumnId={firstDataColumnId}
                    renderExpanded={renderExpanded}
                    colSpan={visibleColumnCount}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {paginationNode}
    </div>
  );
}

function FragmentRow<T>({
  row,
  selected,
  clickable,
  onClick,
  firstDataColumnId,
  renderExpanded,
  colSpan,
}: {
  row: Row<T>;
  selected: boolean;
  clickable: boolean;
  onClick?: () => void;
  firstDataColumnId?: string;
  renderExpanded?: (row: T) => ReactNode;
  colSpan: number;
}) {
  return (
    <>
      <tr className={cx(styles.tr, clickable && styles.clickable)} data-selected={selected || undefined} onClick={onClick}>
        {row.getVisibleCells().map((cell) => {
          const column = cell.column;
          const align = column.columnDef.meta?.align ?? 'left';
          const indent = column.id === firstDataColumnId && row.depth > 0 ? { paddingLeft: `${row.depth * 20 + 12}px` } : undefined;
          return (
            <td
              key={cell.id}
              className={cx(styles.td, styles[`align-${align}`], column.getIsPinned() && styles.pinned)}
              style={{ ...stickyStyle(column), ...indent }}
            >
              {flexRender(column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
      {renderExpanded && row.getIsExpanded() && (
        <tr className={styles.expandedRow}>
          <td colSpan={colSpan} className={styles.expandedCell}>
            {renderExpanded(row.original)}
          </td>
        </tr>
      )}
    </>
  );
}

function DefaultListItem<T>({ row }: { row: Row<T> }) {
  const cells = row.getVisibleCells().filter((cell) => !cell.column.columnDef.meta?.system);
  const [primary, ...rest] = cells;
  return (
    <>
      {primary && <div className={styles.listPrimary}>{flexRender(primary.column.columnDef.cell, primary.getContext())}</div>}
      {rest.length > 0 && (
        <div className={styles.listMeta}>
          {rest.map((cell) => (
            <span key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
          ))}
        </div>
      )}
    </>
  );
}

function ColumnSettings<T>({
  columns,
  onOrderChange,
  onReset,
}: {
  columns: Column<T, unknown>[];
  onOrderChange: (ids: string[]) => void;
  onReset: () => void;
}) {
  const ordered = [...columns].sort((a, b) => a.getIndex() - b.getIndex());

  const move = (column: Column<T, unknown>, delta: -1 | 1) => {
    const ids = ordered.map((c) => c.id);
    const from = ids.indexOf(column.id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to] as string, ids[from] as string];
    onOrderChange(ids);
  };

  return (
    <Popover
      placement="bottom-end"
      aria-label="Настройки колонок"
      trigger={
        <Button size="sm" variant="secondary" icon={<Settings2 />}>
          Колонки
        </Button>
      }
    >
      <div className={styles.settings}>
        <p className={styles.settingsTitle}>Колонки</p>
        <ul className={styles.settingsList}>
          {ordered.map((column, index) => (
            <li key={column.id} className={styles.settingsItem}>
              <Checkbox
                size="sm"
                label={column.columnDef.meta?.label}
                checked={column.getIsVisible()}
                disabled={!column.getCanHide()}
                onChange={column.getToggleVisibilityHandler()}
              />
              <span className={styles.settingsMove}>
                <Button size="sm" variant="ghost" iconOnly icon={<ChevronUp />} aria-label="Выше" disabled={index === 0} onClick={() => move(column, -1)} />
                <Button
                  size="sm"
                  variant="ghost"
                  iconOnly
                  icon={<ChevronDown />}
                  aria-label="Ниже"
                  disabled={index === ordered.length - 1}
                  onClick={() => move(column, 1)}
                />
              </span>
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw />}
          fullWidth
          onClick={onReset}
        >
          Сбросить
        </Button>
      </div>
    </Popover>
  );
}
