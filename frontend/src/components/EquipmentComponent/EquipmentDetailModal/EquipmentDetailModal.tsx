import { useEffect, useState } from 'react';
import { X, Wrench, User, AlertTriangle, FileText } from 'lucide-react';
import styles from './EquipmentDetailModal.module.css';
import { type Equipment } from '@/types/types';
import { type Client } from '@/types/types';
import { type Failure } from '@/types/types';
import {type Order} from '@/types/types'
import SmallClientCard from '@/components/ClientCard/SmallClientCard/SmallClientCard';
import ClientDetailModal from '@/components/ClientCard/ClientDetailModal';
import BACKEND_URL from '@/lib/config';
import FailureMiniCard from '@/components/Failure/FailureMiniCard/FailureMiniCard';
import OrderMiniCard from '@/components/OrderComponent/OrderMiniCard/OrderMiniCard';

export interface EquipmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  closeOnOverlayClick?: boolean;
}

const EquipmentDetailModal = ({
  open,
  onClose,
  equipment,
  closeOnOverlayClick = true,
}: EquipmentDetailModalProps) => {
  const [showModalClient, setShowModalClient] = useState(false);
  const [dataClient, setDataClient] = useState<Client | null>(null);
  const [dataFailures, setDataFailures] = useState<Failure []>([]);
  const [dataOrders, setDataOrders] = useState<Order[]>([]);


  if (!open) return null;

  useEffect(()=>{
    const fetchClient = async () => {    
        try{
            const { id_client } = equipment;
            const client = await fetch(`${BACKEND_URL}/api/clients/${id_client}`,{
                method: "GET",
                credentials:'include',
            });
            const dataClient : Client = await client.json();
            setDataClient(dataClient);
        }catch(e){
            setDataClient(null);
        }
    }
    const fetchFailures = async () => {
        try{
            const id_equipment = equipment?.id_equipment;
            if (!id_equipment) return;
            const failures = await fetch(
                `${BACKEND_URL}/api/failures/ofEquipment/${id_equipment}`,{
                    method:"GET",
                    credentials:'include',
                }
            );
          if (!failures.ok) {
            throw new Error('Error al obtener las fallas');
          }
          const dataFailures = await failures.json();
          setDataFailures(dataFailures);
        }catch(e){
            setDataFailures([]);
        }
    };
    const fetchOrders = async () => {
      try{
        const id_equipment = equipment?.id_equipment;
        if(!id_equipment) return;
        const orders = await fetch(`${BACKEND_URL}/api/orders/ofEquipment/${id_equipment}`, 
          {
            method:"GET",
            credentials: 'include',
          }
        );
        if (!orders.ok) {
            throw new Error('Error al obtener las fallas');
        };
        const dataOrders = await orders.json();
        setDataOrders(dataOrders);
      } catch(e){
        setDataOrders([]);
      }     
    }
    fetchFailures();
    fetchClient();
    fetchOrders();
    },[equipment])

  return (
    <>
      <div
        className={styles.overlay}
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      >
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón para cerrar */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          <h2 className={styles.modalTitle}>Detalles del Equipo</h2>

          <div className={styles.contentGrid}>
            {/* Información Técnica */}
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

            {/* Propietario */}
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

            {/* Fallas Registradas */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <AlertTriangle size={18} className={styles.icon} />
                <h3>Fallas Registradas</h3>
              </div>
              {dataFailures && dataFailures.length > 0 ? (
                <div>
                  {dataFailures.map((failure) => (
                    <FailureMiniCard failure={failure} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No hay fallas registradas asociadas.</p>
              )}
              
            </section>

            {/* Órdenes Registradas */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <FileText size={18} className={styles.icon} />
                <h3>Órdenes Registradas</h3>
              </div>
              {dataOrders && dataOrders.length > 0 ? (
                <div>
                  {dataOrders.map((order) => (
                    <OrderMiniCard order={order}/>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No hay Ordenes registradas asociadas.</p>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Modal Secundario de Cliente */}
      {showModalClient && dataClient && (
        <ClientDetailModal
          client={dataClient}
          equipos={[]}
          open={showModalClient}
          onClose={() => setShowModalClient(false)}
        />
      )}
    </>
  );
};

export default EquipmentDetailModal;