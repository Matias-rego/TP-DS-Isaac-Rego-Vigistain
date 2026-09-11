import { useEffect, useMemo, useState } from 'react';
import { X, Wrench, User, AlertTriangle, FileText } from 'lucide-react';
import styles from './EquipmentDetailModal.module.css';
import { type Equipment } from '@/types/types';
import { type Client } from '@/types/types';
import { type Order, type Failure, type Status_History } from '@/types/types'
import SmallClientCard from '@/components/ClientCard/SmallClientCard/SmallClientCard';
import ClientDetailModal from '@/components/ClientCard/ClientDetailModal/ClientDetailModal';
import BACKEND_URL from '@/lib/config';
import FailureMiniCard from '@/components/Failure/FailureMiniCard/FailureMiniCard';
import OrderMiniCard from '@/components/OrderComponent/OrderMiniCard/OrderMiniCard';
import { EVENTS, eventBus } from '@/lib/eventBus';

export interface EquipmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  closeOnOverlayClick?: boolean;
  // Permite forzar el z-index del overlay. Sirve cuando este modal se abre
  // por encima de otro modal (ej: desde el Detalle de Cliente, que está en
  // 1100, hay que pasarle un valor mayor para que no quede tapado).
  zIndex?: number;
}

const EquipmentDetailModal = ({
  open,
  onClose,
  equipment,
  closeOnOverlayClick = true,
  zIndex,
}: EquipmentDetailModalProps) => {
  const [showModalClient, setShowModalClient] = useState(false);
  const [dataClient, setDataClient] = useState<Client | null>(null);
  const [dataOrders, setDataOrders] = useState<Order[]>([]);

  const sortedOrders = useMemo(
    () =>
      [...dataOrders].sort(
        (a, b) => new Date(b.dateOfEntry).getTime() - new Date(a.dateOfEntry).getTime()
      ),
    [dataOrders]
  );

  const sortedFailures = useMemo(() => {
    const allFailures = dataOrders.flatMap((order) => order.failures ?? []);
    return [...allFailures].sort(
      (a, b) => new Date(b.dateOfFailure).getTime() - new Date(a.dateOfFailure).getTime()
    );
  }, [dataOrders]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { id_client } = equipment;
        const client = await fetch(`${BACKEND_URL}/api/clients/${id_client}`, {
          method: "GET",
          credentials: 'include',
        });
        const dataClient: Client = await client.json();
        setDataClient(dataClient);
      } catch (e) {
        setDataClient(null);
      }
    }
    const fetchOrders = async () => {
      try {
        const id_equipment = equipment?.id_equipment;
        if (!id_equipment) return;
        const orders = await fetch(`${BACKEND_URL}/api/orders/ofEquipment/${id_equipment}`,
          {
            method: "GET",
            credentials: 'include',
          }
        );
        if (!orders.ok) {
          throw new Error('Error al obtener las órdenes');
        };
        const dataOrders = await orders.json();
        setDataOrders(dataOrders);
      } catch (e) {
        setDataOrders([]);
      }
    }
    fetchClient();
    fetchOrders();
  }, [equipment])


  useEffect(() => {
    const handleFailureChanged = (payload: unknown) => {
      const changedFailure = payload as Failure;

      setDataOrders((prev) => {
        const belongsHere = prev.some((o) => o.id_order === changedFailure.id_order);
        if (!belongsHere) return prev; // no es de este equipo, ignorar

        return prev.map((order) => {
          if (order.id_order !== changedFailure.id_order) return order;

          const currentFailures = order.failures ?? [];
          const exists = currentFailures.some((f) => f.id_failure === changedFailure.id_failure);

          return {
            ...order,
            failures: exists
              ? currentFailures.map((f) =>
                  f.id_failure === changedFailure.id_failure ? changedFailure : f
                )
              : [...currentFailures, changedFailure],
          };
        });
      });
    };

    eventBus.on(EVENTS.failureChanged, handleFailureChanged);
    return () => eventBus.off(EVENTS.failureChanged, handleFailureChanged);
  }, []);

  // Igual criterio para cambios de estado de orden: si en otro lado se
  // confirma un nuevo Status_History, reflejamos el estado actualizado acá.
  useEffect(() => {
    const handleStatusChanged = (payload: unknown) => {
      const newStatus = payload as Status_History;

      setDataOrders((prev) => {
        const belongsHere = prev.some((o) => o.id_order === newStatus.id_order);
        if (!belongsHere) return prev;

        return prev.map((order) =>
          order.id_order === newStatus.id_order
            ? {
                ...order,
                status: newStatus.status,
                statusHistory: [...(order.statusHistory ?? []), newStatus],
              }
            : order
        );
      });
    };

    eventBus.on(EVENTS.statusChanged, handleStatusChanged);
    return () => eventBus.off(EVENTS.statusChanged, handleStatusChanged);
  }, []);
  useEffect(() => {
    const handleFailureDeleted = (payload: unknown) => {
      const { id_failure, id_order } = payload as { id_failure: string; id_order: string };

      setDataOrders((prev) => {
        const belongsHere = prev.some((o) => o.id_order === id_order);
        if (!belongsHere) return prev;

        return prev.map((order) =>
          order.id_order === id_order
            ? { ...order, failures: (order.failures ?? []).filter((f) => f.id_failure !== id_failure) }
            : order
        );
      });
    };

    eventBus.on(EVENTS.failureDeleted, handleFailureDeleted);
    return () => eventBus.off(EVENTS.failureDeleted, handleFailureDeleted);
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className={styles.overlay}
        style={zIndex !== undefined ? { zIndex } : undefined}
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      >
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          <h2 className={styles.modalTitle}>Detalles del Equipo</h2>

          <div className={styles.contentGrid}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Wrench size={18} className={styles.icon} />
                <h3>Información Técnica</h3>
              </div>
              <div className={styles.technicalCards}>
                <div className={styles.technicalCard}>
                  <span className={styles.label}>Tipo</span>
                  <span className={styles.value}>{equipment.tipo_equipment || '---'}</span>
                </div>
                <div className={styles.technicalCard}>
                  <span className={styles.label}>Marca</span>
                  <span className={styles.value}>{equipment.brand || '---'}</span>
                </div>
                <div className={styles.technicalCard}>
                  <span className={styles.label}>Modelo</span>
                  <span className={styles.value}>{equipment.model || '---'}</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <User size={18} className={styles.icon} />
                <h3>Propietario</h3>
              </div>
              {dataClient ? (
                <SmallClientCard
                  id_client={dataClient?.id_client}
                  clientName={String(dataClient?.clientName)}
                  registrationYear={String(dataClient?.dateOfRegistration)}
                  onClick={() => setShowModalClient(true)}
                />
              ) : (
                <p className={styles.emptyText}>Sin cliente asignado</p>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <AlertTriangle size={18} className={styles.icon} />
                <h3>Fallas Registradas</h3>
              </div>
              {sortedFailures.length > 0 ? (
                <div className={styles.cardsGrid}>
                  {sortedFailures.map((failure) => (
                    <FailureMiniCard key={failure.id_failure} failure={failure} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No hay fallas registradas asociadas.</p>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <FileText size={18} className={styles.icon} />
                <h3>Órdenes Registradas</h3>
              </div>
              {sortedOrders.length > 0 ? (
                <div>
                  {sortedOrders.map((order) => (
                    <OrderMiniCard key={order.id_order} order={order} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No hay Ordenes registradas asociadas.</p>
              )}
            </section>
          </div>
        </div>
      </div>

      {showModalClient && dataClient && (
        <ClientDetailModal
          client={dataClient}
          open={showModalClient}
          onClose={() => setShowModalClient(false)}
        />
      )}
    </>
  );
};

export default EquipmentDetailModal;