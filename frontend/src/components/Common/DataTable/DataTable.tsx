import type { ReactNode } from 'react';
import styles from './DataTable.module.css';


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface ColumnConfig<T extends object = object> {
  key: keyof T | 'actions';
  label: string;
  format?: (value: unknown) => string;
  render?: (item: T) => ReactNode;
  isTotalField?: boolean;
}

interface DataTableProps<T extends object> {
  data: T[];
  idField: keyof T;
  columns: ColumnConfig<T>[];
  caption?: string;
  showTotal?: boolean;
  onRowClick?: (item: T) => void;
  selectedId?: T[keyof T];
}

// 'actions' no es un dato del item: para esa columna no hay valor que leer
const getValue = <T extends object>(item: T, key: ColumnConfig<T>['key']): unknown =>
  key === 'actions' ? undefined : item[key];

function DataTable<T extends object>({
  data,
  idField,
  columns,
  caption,
  showTotal = false,
  onRowClick,
  selectedId,
}: DataTableProps<T>) {
  const totalColumn = columns.find((c) => c.isTotalField);
  const total =
    showTotal && totalColumn
      ? data.reduce((acc, item) => acc + Number(getValue(item, totalColumn.key) ?? 0), 0)
      : 0;

  return (
    <div className={styles.tableContainer}>
      <Table className={styles.table}>
        {caption && <TableCaption className={styles.caption}>{caption}</TableCaption>}

        <TableHeader className={styles.header}>
          <TableRow className={styles.headerRow}>
            {columns.map((col) => (
              <TableHead key={String(col.key)} className={styles.head}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className={styles.tableBody}>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={styles.cell}
                style={{ textAlign: 'center' }}
              >
                No hay registros para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const isSelected = selectedId !== undefined && item[idField] === selectedId;
              return (
                <TableRow
                  key={String(item[idField])}
                  className={`${styles.bodyRow} ${onRowClick ? styles.clickableRow : ''} ${isSelected ? styles.selectedRow : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => {
                    const value = getValue(item, col.key);
                    return (
                      <TableCell key={String(col.key)} className={styles.cell}>
                        {col.render
                          ? col.render(item)
                          : col.format
                            ? col.format(value)
                            : String(value ?? '')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
        {showTotal && totalColumn && (
          <TableFooter className={styles.footer}>
            <TableRow className={styles.footerRow}>
              <TableCell colSpan={columns.length - 1} className={styles.footerCell}>
                Total
              </TableCell>
              <TableCell className={`${styles.footerCell} ${styles.total}`}>
                {totalColumn.format
                  ? totalColumn.format(total)
                  : `$${total.toLocaleString('es-AR')}`}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

export default DataTable;