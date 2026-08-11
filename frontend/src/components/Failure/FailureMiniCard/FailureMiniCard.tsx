import styles from './FailureMiniCard.module.css';
import { type Failure } from '@/types/types';

export type EnumFailureStatus = 'DIAGNOSTICADA' | 'RESUELTA';

const STATUS_CONFIG: Record<EnumFailureStatus, { label: string; className: string }> = {
  DIAGNOSTICADA: { label: 'Diagnosticada', className: 'inProgress' }, // Usa la clase CSS que prefieras
  RESUELTA:      { label: 'Resuelta',      className: 'resolved' },
};

export interface FailureMiniCardProps {
  failure: Failure;
  onClick?: (id_failure: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const FailureMiniCard = ({ failure, onClick }: FailureMiniCardProps) => {
  const clickable = typeof onClick === 'function';

  // Normalizamos a mayúsculas para matchear con STATUS_CONFIG
  const statusKey = String(failure.status).toUpperCase() as EnumFailureStatus;
  const statusInfo = STATUS_CONFIG[statusKey] ?? {
    label: String(failure.status),
    className: 'pending',
  };

  // Si trae el tipo de falla usás su nombre; si no, ponés un título general y abajo la descripción
  const title = failure.failureType?.failureDescription ?? 'Falla reportada';

  return (
    <div
      className={`${styles.card} ${clickable ? styles.clickable : ''}`}
      onClick={clickable ? () => onClick!(failure.id_failure) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={`${styles.badge} ${styles[statusInfo.className]}`}>
          {statusInfo.label}
        </span>
      </div>

      <p className={styles.description}>{failure.description}</p>

      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(failure.dateOfFailure)}</span>
        {failure.failureType?.estimatedImport !== undefined && (
          <span className={styles.amount}>
            {formatCurrency(failure.failureType.estimatedImport)}
          </span>
        )}
      </div>
    </div>
  );
};

export default FailureMiniCard;