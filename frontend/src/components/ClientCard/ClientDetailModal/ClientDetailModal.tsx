import { useState, useEffect } from "react";
import DetailModal from "@/components/Modals/DetailModal";
import type { DetailFieldConfig, DetailItemConfig } from "@/components/Modals/DetailModal";
import styles from './ClientDetailModal.module.css';
import { eventBus } from "@/lib/eventBus";
import { BACKEND_URL } from "@/lib/config";
import type { Equipment } from "@/types/types";
import EquipmentMiniDescriptiveCard from "@/components/EquipmentComponent/EquipmentMiniDescriptiveCard/EquipmentMiniDescriptiveCard";
import type { Client as BaseClient } from "@/types/types";

// Extendemos la interfaz BaseClient para agregar la propiedad aplanada
interface Client extends BaseClient {
  clientTypeName?: string;
}

const clientFields: DetailFieldConfig<Client>[] = [
  { name: 'clientName', label: 'Nombre Completo' },
  { name: 'clientEmail', label: 'Email' },
  { name: 'cuit', label: 'CUIT' },
  { name: 'clientTypeName', label: 'Categoría' },
  { name: 'clientPhone', label: 'Teléfono' },
  {
    name: 'dateOfRegistration',
    label: 'Fecha de registro',
    format: (value) =>
      new Date(value as string | Date).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
];

const equipmentItemConfig: DetailItemConfig<Equipment> = {
  getKey: (item) => item.id_equipment,
  primary: (item) => item.tipo_equipment,
  secondary: (item) => `Modelo: ${item.model}`,
  onClick: (item) => console.log('Equipo', item.id_equipment) ,
};

interface ClientDetailModalProps {
  client: Client;
  open: boolean;
  onClose: () => void;
  entityEvent?: string;
}

const ClientDetailModal = ({
  client,
  open,
  onClose,
  entityEvent,
}: ClientDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState<Client>(client);
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  // Sincronizar formData cuando el padre actualiza client (post-guardado)
  useEffect(() => {
    setFormData(client);
  }, [client]);
  
  useEffect(() => {
    if (!open || !client?.id_client) return;

    const searchEquipments = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/equipments/equipmentForClient/${client.id_client}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Error al obtener equipos');

        const data: Equipment[] = await response.json();
        setEquipments(data);
      } catch (e) {
        console.error('Error fetching equipments:', e);
        setEquipments([]);
      }
    };

    searchEquipments();
  }, [client.id_client, open]);

  // Resetear modo edición al cerrar
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const handleEdit = async (data: Client): Promise<boolean> => {
    try {
      // 1. Extraemos solo los campos permitidos por el schema de actualización del backend
      const payload = {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        cuit: data.cuit,
      };

      const response = await fetch(
        `${BACKEND_URL}/api/clients/${data.id_client}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload), // Enviamos únicamente el payload limpio
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Cliente editado con éxito:', result);

      // Emitir evento para refrescar la vista
      if (entityEvent) eventBus.emit(entityEvent, result);

      return true;
    } catch (error) {
      console.error('Error al editar cliente:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const exito = await handleEdit(formData);
    if (exito) {
      setIsEditing(false);
      // El useEffect [client] se encargará de actualizar formData
      // cuando Clientes.tsx refresque y pase el client actualizado
    }
  };

  return (
    <DetailModal
      open={open}
      onClose={() => { setIsEditing(false); onClose(); }}
      title={isEditing ? "Editar Cliente" : "Detalle de Cliente"}
      data={isEditing ? formData : client}
      fields={isEditing ? [] : clientFields}
      statusField="status"
      statusLabel={(value) => (value === true ? "Activo" : "Inactivo")}
      statusTone={(value) => (value === true ? "active" : "inactive")}
      listTitle="Equipos asociados"
      items={isEditing ? [] : equipments}
      itemConfig={isEditing ? undefined : equipmentItemConfig}
      actions={
        isEditing
          ? [{ label: 'Guardar', variant: 'primary', onClick: () => handleSave() }]
          : [{ label: 'Editar Cliente', variant: 'secondary', onClick: () => setIsEditing(true) }]
      }
      cancelLabel={isEditing ? "Cancelar" : "Cerrar"}
      zIndex={1100}
      onCancel={() => isEditing ? setIsEditing(false) : onClose()}
    >
      {isEditing && (
        <form className={styles.editFormGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nombre Completo</label>
            <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>CUIT</label>
            <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Teléfono</label>
            <input type="text" name="clientPhone" value={formData.clientPhone} onChange={handleChange} className={styles.formInput} />
          </div>
        </form>
      )}
    </DetailModal>
  );
};

export default ClientDetailModal;