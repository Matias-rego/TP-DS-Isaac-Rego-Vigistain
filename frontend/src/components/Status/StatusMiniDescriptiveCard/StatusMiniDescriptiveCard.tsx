import { type Status_History, type EnumOrderStatus } from "@/types/types";
import styles from './StatusMiniDescriptiveCard.module.css';

const STATUS_META: Record<EnumOrderStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  recibido:      { label: 'Recibido',          tone: 'info' },
  diagnostico:   { label: 'En diagnóstico',    tone: 'warning' },
  presupuestado: { label: 'Presupuestado',     tone: 'info' },
  aprobado:      { label: 'Aprobado',          tone: 'warning' },
  reparacion:    { label: 'En reparación',     tone: 'warning' },
  listo:         { label: 'Listo para retirar',tone: 'success' },
  entregado:     { label: 'Entregado',         tone: 'success' },
  cancelado:     { label: 'Cancelado',         tone: 'danger' },
};

export interface StatusMiniDescriptiveCardProps {
  statusHistory: Status_History;
  active?: boolean; // true = evento más reciente (con borde), false = evento pasado (más sutil)
  onClick?: (id_status_history: number) => void;
}

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'justo ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;

  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `hace ${diffHrs}h`;

  const diffDays = Math.round(diffHrs / 24);
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays}d`;

  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitial = (name?: string) => (name?.trim()?.[0] ?? '?').toUpperCase();

const StatusMiniDescriptiveCard = ({ statusHistory, active = true, onClick }: StatusMiniDescriptiveCardProps) => {
  const clickable = typeof onClick === 'function';

  const statusInfo = STATUS_META[statusHistory.status] ?? {
    label: String(statusHistory.status),
    tone: 'info' as const,
  };

  const userName = statusHistory.user?.userName ?? 'Usuario';
  const userPicture = statusHistory.user?.urlPicture;

  return (
    <div
      className={`${styles.card} ${active ? styles.active : styles.muted} ${clickable ? styles.clickable : ''}`}
      onClick={clickable ? () => onClick!(statusHistory.id_status_history) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[statusInfo.tone]}`}>
          {statusInfo.label}
        </span>
        <span className={styles.time}>{formatRelativeTime(statusHistory.dateOfChange)}</span>
      </div>

      {statusHistory.comment && (
        <p className={styles.comment}>{statusHistory.comment}</p>
      )}

      <div className={styles.author}>
        {userPicture ? (
          <img src={userPicture} alt={userName} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarFallback}>{getInitial(userName)}</span>
        )}
        <span className={styles.userName}>{userName}</span>
      </div>
    </div>
  );
};

export default StatusMiniDescriptiveCard;