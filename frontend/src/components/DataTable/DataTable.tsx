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

interface FailureType {
  id_failure_type: number;
  failureDescription: string;
  estimatedImport: number;
}

interface TableRtlProps {
  data: FailureType[];
}

function TableRtl({ data }: TableRtlProps) {
  const total = data.reduce((acc, item) => acc + item.estimatedImport, 0);

  return (
    <div className={styles.tableContainer}>
      <Table className={styles.table}>
        <TableCaption className={styles.caption}>
          Lista de tipos de falla registrados.
        </TableCaption>
        <TableHeader className={styles.header}>
          <TableRow className={styles.headerRow}>
            <TableHead className={styles.head}>ID</TableHead>
            <TableHead className={styles.head}>Descripción</TableHead>
            <TableHead className={styles.head}>Costo Estimado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={styles.tableBody}>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className={styles.cell} style={{ textAlign: "center" }}>
                No hay tipos de falla para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id_failure_type} className={styles.bodyRow}>
                <TableCell className={styles.cell}>{item.id_failure_type}</TableCell>
                <TableCell className={styles.cell}>{item.failureDescription}</TableCell>
                <TableCell className={styles.cell}>${item.estimatedImport.toLocaleString("es-AR")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter className={styles.footer}>
          <TableRow className={styles.footerRow}>
            <TableCell colSpan={2} className={styles.footerCell}>Total</TableCell>
            <TableCell className={`${styles.footerCell} ${styles.total}`}>
              ${total.toLocaleString("es-AR")}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default TableRtl;