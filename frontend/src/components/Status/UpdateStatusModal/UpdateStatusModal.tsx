import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { type Order, type EnumOrderStatus, type Status_History } from '@/types/types';
import ActionButton from '@/components/Common/Buttons/ActionButton';
import styles from './UpdateStatusModal.module.css';
import BACKEND_URL from '@/lib/config';
import { useAuth } from '@/lib/AuthContext';
import { EVENTS, eventBus } from '@/lib/eventBus';
import Diagnostic from './Diagnostic/Diagnostic';
import Budget from './Budget/Budget';

const STATUS_LABELS: Record<EnumOrderStatus, string> = {
  recibido:      'Recibido',
  diagnostico:   'Diagnóstico',
  presupuestado: 'Presupuestado',
  aprobado:      'Aprobado',
  reparacion:    'Reparación',
  listo:         'Listo',
  entregado:     'Entregado',
  cancelado:     'Cancelado',
};

// Título del campo de comentario según el estado elegido. Los estados que
// no están acá caen en el label genérico "Comentarios".
const COMMENT_LABELS: Partial<Record<EnumOrderStatus, string>> = {
  diagnostico:   'Comentarios del Diagnóstico',
  presupuestado: 'Comentarios del Presupuesto',
  reparacion:    'Comentarios de la Reparación',
  listo:         'Comentarios de Entrega',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as EnumOrderStatus[];

function getCurrentStatus(history?: Status_History[]): EnumOrderStatus | null {
  if (!history || history.length === 0) return null;
  const latest = [...history].sort(
    (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
  )[0];
  return latest.status;
}

export interface UpdateStatusModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onConfirm: (createdStatusHistory: Status_History) => void | Promise<void>;
}

const UpdateStatusModal = ({ open, order, onClose, onConfirm }: UpdateStatusModalProps) => {
  const currentStatus = useMemo(
    () => getCurrentStatus(order.statusHistory),
    [order.statusHistory]
  );

  // Antes se filtraban los estados ya usados en el historial, lo que
  // impedía volver a un estado anterior (ej. de "presupuestado" de nuevo
  // a "diagnostico"). Ahora se puede elegir cualquiera — todavía no hay
  // una máquina de estados que valide qué transiciones son válidas, eso
  // queda para más adelante.
  const availableStatuses = ALL_STATUSES;

  const [status, setStatus] = useState<EnumOrderStatus | undefined>(undefined);
  const [comment, setComment] = useState('');
  const [notifyClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  if (!open) return null;

  const canSubmit = status !== undefined && !submitting;
  const commentLabel = status ? (COMMENT_LABELS[status] ?? 'Comentarios') : 'Comentarios';

  const handleConfirm = async () => {
    if (!canSubmit || !status) return;

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      id_order: order.id_order,
      status,
      id_user: user?.id_user,
      comment: comment.trim() ? comment.trim() : null,
      notifyClient,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message ?? `Error ${res.status} al actualizar el estado`);
      }

      const createdStatusHistory: Status_History = await res.json();

      eventBus.emit(EVENTS.statusChanged, createdStatusHistory);

      await onConfirm(createdStatusHistory);
      onClose();
    } catch (e) {
      console.error('Error en la actualización de estado', e);
      setErrorMessage(
        e instanceof Error ? e.message : 'No se pudo actualizar el estado. Intentá de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Actualizar Estado de Orden</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="new-status">Nuevo Estado</label>
          <select
            id="new-status"
            className={styles.select}
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value as EnumOrderStatus)}
            disabled={submitting}
          >
            <option value="" disabled>Seleccioná un estado...</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
                {s === currentStatus ? ' (actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          {status === 'diagnostico' && (
            <div>
              <Diagnostic order={order} />
            </div>
          )}
          {status === 'presupuestado' && (
            <div>
              <Budget order={order} />
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="status-comment">{commentLabel}</label>
          <textarea
            id="status-comment"
            className={styles.textarea}
            rows={3}
            placeholder="Agregá una observación sobre este cambio de estado (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/*
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            disabled={submitting}
          />
          Notificar al Cliente
        </label>
           */}

        {errorMessage && (
          <p className={styles.errorText}>{errorMessage}</p>
        )}

        <div className={styles.actions}>
          <ActionButton
            label="Confirmar Cambio"
            icon={null}
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleConfirm}
          />
          <ActionButton
            label="Cancelar"
            icon={null}
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;