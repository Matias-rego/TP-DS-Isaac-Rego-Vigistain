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

// ─── Column config ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ColumnConfig<T extends Record<string, any> = Record<string, any>> {
  /** Key del objeto a mostrar */
  key: keyof T;
  /** Header visible */
  label: string;
  /** Formateador opcional del valor (devuelve string) */
  format?: (value: unknown) => string;
  /** Renderer opcional de la celda completa (devuelve JSX, ej: badges, íconos) */
  render?: (item: T) => React.ReactNode;
  /** Si es la columna que se suma en el footer total */
  isTotalField?: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TableRtlProps<T extends Record<string, any>> {
  data: T[];
  /** Key que identifica unívocamente cada fila (para el key de React) */
  idField: keyof T;
  columns: ColumnConfig<T>[];
  caption?: string;
  /** Si true, muestra el footer con la suma de la columna marcada con isTotalField */
  showTotal?: boolean;
  /** Se dispara al clickear una fila */
  onRowClick?: (item: T) => void;
  /** Id de la fila actualmente seleccionada, para resaltarla */
  selectedId?: T[keyof T];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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