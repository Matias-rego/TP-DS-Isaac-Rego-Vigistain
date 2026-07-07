import { useState, useEffect } from "react";
import DetailModal from "../Modals/DetailModal";
import type { DetailFieldConfig, DetailItemConfig } from "../Modals/DetailModal";
import styles from './ClientDetailModal.module.css';
import { parseJwt } from "@/pages/App/App";
import { eventBus } from "@/lib/eventBus";
import { BACKEND_URL } from "@/lib/config";

interface Client {
  id_client: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dniCuit: string;
  dateOfRegistration: string;
  categoryClientName?: string;
  status?: boolean;
  lastRepair?: string;
  tags?: string[];
  onClick?: (id: number) => void;
}

interface Equipment {
  id: string;
  model: string;
  serialNumber: string;
}

const clientFields: DetailFieldConfig<Client>[] = [
  { name: 'clientName',    label: 'Nombre Completo' },
  { name: 'clientEmail',   label: 'Email' },
  { name: 'dniCuit',       label: 'DNI/CUIT' },
  { name: 'categoryClientName', label: 'Categoría' },
  { name: 'clientPhone',   label: 'Teléfono' },
  {
    name: 'dateOfRegistration',
    label: 'Fecha de registro',
    format: (value) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }),
  },
];

const equipmentItemConfig: DetailItemConfig<Equipment> = {
  getKey: (item) => item.id,
  primary: (item) => item.model,
  secondary: (item) => `SN: ${item.serialNumber}`,
  onClick: (item) => console.log('abrir equipo', item.id),
};

interface ClientDetailModalProps {
  client: Client;
  equipos: Equipment[];
  open: boolean;
  onClose: () => void;
  entityEvent: string;
}

const ClientDetailModal = ({
  client,
  equipos,
  open,
  onClose,
  entityEvent,
}: ClientDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState<Client>(client);

  // Sincronizar formData cuando el padre actualiza client (post-guardado)
  useEffect(() => {
    setFormData(client);
  }, [client]);

  // Resetear modo edición al cerrar
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const handleEdit = async (data: Client): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de sesión.');

      const decoded = parseJwt(token);
      if (!decoded?.id_user) throw new Error('Token inválido o expirado.');

      const response = await fetch(
        `${BACKEND_URL}/clients/modifyClient/${data.id_client}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Cliente editado con éxito:', result);

      // Emitir evento → Clientes.tsx refrescará la lista y el cliente del modal
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
      items={isEditing ? [] : equipos}
      itemConfig={isEditing ? undefined : equipmentItemConfig}
      actions={
        isEditing
          ? [{ label: 'Guardar', variant: 'primary', onClick: () => handleSave() }]
          : [{ label: 'Editar Cliente', variant: 'secondary', onClick: () => setIsEditing(true) }]
      }
      cancelLabel={isEditing ? "Cancelar" : "Cerrar"}
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
            <label className={styles.inputLabel}>DNI/CUIT</label>
            <input type="text" name="dniCuit" value={formData.dniCuit} onChange={handleChange} className={styles.formInput} />
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