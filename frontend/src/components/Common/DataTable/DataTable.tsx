"use client"
import styles from "./DataTable.module.css";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface ColumnConfig<T extends Record<string, any> = Record<string, any>> {
  key: keyof T | 'actions';
  label: string;
  format?: (value: unknown) => string;
  render?: (item: T) => React.ReactNode;
  isTotalField?: boolean;
}

interface TableRtlProps<T extends Record<string, any>> {
  data: T[];
  idField: keyof T;
  columns: ColumnConfig<T>[];
  caption?: string;
  showTotal?: boolean;
  onRowClick?: (item: T) => void;
  selectedId?: T[keyof T];
}

function TableRtl<T extends Record<string, any>>({
  data,
  idField,
  columns,
  caption,
  showTotal = false,
  onRowClick,
  selectedId,
}: TableRtlProps<T>) {
  const totalColumn = columns.find(c => c.isTotalField);
  const total = showTotal && totalColumn
    ? data.reduce((acc, item) => acc + Number(item[totalColumn.key] ?? 0), 0)
    : 0;

  return (
    <div className={styles.tableContainer}>
      <Table className={styles.table}>
        {caption && (
          <TableCaption className={styles.caption}>{caption}</TableCaption>
        )}
        <TableHeader className={styles.header}>
          <TableRow className={styles.headerRow}>
            {columns.map(col => (
              <TableHead key={String(col.key)} className={styles.head}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className={styles.tableBody}>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className={styles.cell} style={{ textAlign: "center" }}>
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
                  {columns.map(col => (
                    <TableCell key={String(col.key)} className={styles.cell}>
                      {col.render
                        ? col.render(item)
                        : col.format
                          ? col.format(item[col.key])
                          : String(item[col.key] ?? '')}
                    </TableCell>
                  ))}
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
                  : `$${total.toLocaleString("es-AR")}`}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

export default TableRtl;