
// src/components/EntityManagement/EntityManagement.tsx
import { useState, type ComponentProps, type ComponentType } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { usePagination } from '@/hooks/usePagination';
import { EntityHeader, ToolbarButton, type ViewMode } from '@/components/EntityHeader';
import { SearchBarV2 } from '@/components/SearchBarV2/SearchBarV2';
import DataTable, { type ColumnConfig } from '@/components/Common/DataTable/DataTable';
import DataCard from '@/components/Common/DataCard/DataCard';
import type { BaseQuery, PaginatedResponse } from '@/types/pagination';
import styles from './EntityManagement.module.css';
import type { LucideIcon } from 'lucide-react';

export interface EntityConfig<T extends object, Q extends BaseQuery> {
  title: string;
  queryKey: QueryKey;
  queryFn: (query: Q, signal: AbortSignal) => Promise<PaginatedResponse<T>>;
  idField: keyof T;
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  card: { titleField: keyof T; descriptionField?: keyof T };
  searchPlaceholder?: string;
  filterKeys?: (keyof Q)[];
  initialQuery?: Q;
}

interface ActionBase {
  label: string;
  icon?: LucideIcon;
  variant?: ComponentProps<typeof ToolbarButton>['variant'];
}

interface GlobalAction extends ActionBase {
  requiresSelection?: false;
  disabled?: boolean;
  onClick: () => void;
}

interface ItemAction<T> extends ActionBase {
  requiresSelection: true;
  disabled?: (item: T) => boolean;
  onClick: (item: T) => void;
}

export type ActionConfig<T extends object> = GlobalAction | ItemAction<T>;

export interface FiltersProps<Q extends BaseQuery> {
  query: Q;
  updateQuery: (patch: Partial<Q>) => void;
}

interface EntityManagementProps<T extends object, Q extends BaseQuery> {
  config: EntityConfig<T, Q>;
  Filters?: ComponentType<FiltersProps<Q>>;
  
}

export function EntityManagement<T extends object, Q extends BaseQuery>({
  config,
  Filters,
}: EntityManagementProps<T, Q>) {
  const { title, queryKey, queryFn, idField, columns, actions, card, searchPlaceholder, filterKeys, initialQuery } = config;

  const [selectedId, setSelectedId] = useState<T[keyof T]>();
  const [view, setView] = useState<ViewMode>('list');

  const pagination = usePagination<T, Q>({
    queryKey,
    queryFn,
    initialQuery: initialQuery ?? ({ page: 1, limit: 10 } as Q),
  });
  const { items, query, updateQuery, isLoading, isFetching, error } = pagination;

  // sale de `items`: si la selección quedó en otra página, los botones se deshabilitan
  const selected = items.find((item) => item[idField] === selectedId);

  const toggleSelect = (item: T) =>
    setSelectedId((prev) => (prev === item[idField] ? undefined : item[idField]));


  const cardFields = columns.filter(
    (c) => c.key !== card.titleField && c.key !== card.descriptionField
  );

  return (
    <div className={styles.page}>
      <EntityHeader title={title} view={view} onViewChange={setView}>
        {actions && actions.map((action) =>
          action.requiresSelection ? (
            <ToolbarButton
              key={action.label}
              icon={action.icon}
              variant={action.variant}
              disabled={!selected || action.disabled?.(selected)}
              onClick={() => selected && action.onClick(selected)}
            >
              {action.label}
            </ToolbarButton>
          ) : (
            <ToolbarButton
              key={action.label}
              icon={action.icon}
              variant={action.variant}
              disabled={action.disabled}
              onClick={() => action.onClick()}
            >
              {action.label}
            </ToolbarButton>
          )
        )}
      </EntityHeader>

      <SearchBarV2
        pagination={pagination}
        searchPlaceholder={searchPlaceholder}
        filterKeys={filterKeys}>
        {Filters ? <Filters query={query} updateQuery={updateQuery} /> : undefined}
      </SearchBarV2>

      {isLoading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p>{error.message}</p>
      ) : (
        <div className={isFetching ? styles.fetching : undefined}>
          {view === 'list' ? (
            <DataTable
              data={items}
              idField={idField}
              columns={columns}
              selectedId={selectedId}
              onRowClick={toggleSelect}
            />
          ) : (
            <DataCard
              data={items}
              idField={idField}
              titleField={card.titleField}
              descriptionField={card.descriptionField}
              fields={cardFields}
              selectedId={selectedId}
              onCardClick={toggleSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}