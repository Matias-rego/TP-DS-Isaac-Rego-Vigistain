import { type Order } from "@/types/types";
import styles from './OrderMiniCard.module.css';
export type EnumOrderStatus =
  | 'recibido'
  | 'diagnostico'
  | 'presupuestado'
  | 'aprobado'
  | 'reparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

const STATUS_CONFIG: Record<EnumOrderStatus, { label: string; className: string }> = {
  recibido:      { label: 'Recibido',      className: 'pending' },
  diagnostico:   { label: 'Diagnóstico',   className: 'inProgress' },
  presupuestado: { label: 'Presupuestado', className: 'quoted' },
  aprobado:      { label: 'Aprobado',      className: 'approved' },
  reparacion:    { label: 'Reparación',    className: 'inProgress' },
  listo:         { label: 'Listo',         className: 'resolved' },
  entregado:     { label: 'Entregado',     className: 'delivered' },
  cancelado:     { label: 'Cancelado',     className: 'cancelled' },
};

export interface OrderMiniCardProps {
  order: Order;
  onClick?: (id_order: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const OrderMiniCard = ({ order, onClick }: OrderMiniCardProps) => {
  const clickable = typeof onClick === 'function';
  const statusInfo = STATUS_CONFIG[order.status as unknown as EnumOrderStatus] ?? {
    label: String(order.status),
    className: 'pending',
  };

  const equipmentLabel = order.equipment
    ? `${order.equipment.brand ?? ''} ${order.equipment.model ?? ''}`.trim()
    : `Equipo #${order.id_equipment}`;

  const clientLabel = order.user?.userName;

  return (
    <div
      className={`${styles.card} ${clickable ? styles.clickable : ''}`}
      onClick={clickable ? () => onClick!(order.id_order) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.orderId}>Orden #{order.id_order}</span>
          <span className={styles.equipment}>{equipmentLabel}</span>
        </div>
        <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
          {statusInfo.label}
        </span>
      </div>

      <p className={styles.failure}>{order.failureReported}</p>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {clientLabel && <span className={styles.client}>{clientLabel}</span>}
          <span className={styles.date}>{formatDate(order.dateOfEntry)}</span>
        </div>
        {order.totalCharged !== null && order.totalCharged !== undefined && (
          <span className={styles.amount}>{formatCurrency(order.totalCharged)}</span>
        )}
      </div>
    </div>
  );
};

export default OrderMiniCard;