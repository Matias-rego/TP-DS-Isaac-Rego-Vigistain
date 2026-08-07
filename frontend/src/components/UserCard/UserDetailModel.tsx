import { useState, useEffect } from "react";
import DetailModal from "../Modals/DetailModal";
import type { DetailFieldConfig, DetailItemConfig, DetailModalAction } from "../Modals/DetailModal";
import styles from './UserDetailModal.module.css';
import { eventBus } from "@/lib/eventBus";
import { BACKEND_URL } from "@/lib/config";

interface User {
  id_user: number;
  userName: string;
  email: string;
  rol: string;
  status?: boolean;
  validationStatus?: boolean;
  urlPicture?: string;
  onClick?: (id: number) => void;
}

// Nota: los campos de Order asumidos abajo (id, status, date) son un placeholder
// razonable — ajustá OrderSummary/orderItemConfig a las columnas reales de tu modelo Order.
interface OrderSummary {
  id: string;
  status: string;
  date?: string;
}

const userFields: DetailFieldConfig<User>[] = [
  { name: 'userName', label: 'Nombre de usuario' },
  { name: 'email',    label: 'Email' },
  { name: 'rol',       label: 'Rol' },
  {
    name: 'validationStatus',
    label: 'Validación',
    format: (value) => (value === true ? 'Validado' : 'Pendiente de validación'),
  },
];

const orderItemConfig: DetailItemConfig<OrderSummary> = {
  getKey: (item) => item.id,
  primary: (item) => `Pedido #${item.id}`,
  secondary: (item) => item.status,
  onClick: (item) => console.log('abrir pedido', item.id),
};

interface UserDetailModalProps {
  user: User;
  orders: OrderSummary[];
  open: boolean;
  onClose: () => void;
  entityEvent?: string;
}

const UserDetailModal = ({
  user,
  orders,
  open,
  onClose,
  entityEvent,
}: UserDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState<User>(user);

  // Sincronizar formData cuando el padre actualiza user (post-guardado)
  useEffect(() => {
    setFormData(user);
  }, [user]);

  // Resetear modo edición al cerrar
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const handleEdit = async (data: User): Promise<boolean> => {
    try {

      const response = await fetch(
        `${BACKEND_URL}/api/users/${data.id_user}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Usuario editado con éxito:', result);

      // Emitir evento → Usuarios.tsx refrescará la lista y el usuario del modal
      if (entityEvent) eventBus.emit(entityEvent, result);

      return true;
    } catch (error) {
      console.error('Error al editar usuario:', error);
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
    }
  };

  const handleValidate = async () => {
    await handleEdit({ ...user, validationStatus: true });
  };

  return (
    <DetailModal
      open={open}
      onClose={() => { setIsEditing(false); onClose(); }}
      title={isEditing ? "Editar Usuario" : "Detalle de Usuario"}
      data={isEditing ? formData : user}
      fields={isEditing ? [] : userFields}
      statusField="status"
      statusLabel={(value) => (value === true ? "Activo" : "Inactivo")}
      statusTone={(value) => (value === true ? "active" : "inactive")}
      listTitle="Pedidos asociados"
      items={isEditing ? [] : orders}
      itemConfig={isEditing ? undefined : orderItemConfig}
      actions={
        isEditing
          ? ([{ label: 'Guardar', variant: 'primary', onClick: () => handleSave() }] as DetailModalAction<User>[])
          : ([
              ...(user.validationStatus === false
                ? [{ label: 'Validar Usuario', variant: 'primary', onClick: () => handleValidate() }]
                : []),
              { label: 'Editar Usuario', variant: 'secondary', onClick: () => setIsEditing(true) },
            ] as DetailModalAction<User>[])
      }
      cancelLabel={isEditing ? "Cancelar" : "Cerrar"}
      onCancel={() => isEditing ? setIsEditing(false) : onClose()}
    >
      {isEditing && (
        <form className={styles.editFormGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nombre de usuario</label>
            <input type="text" name="userName" value={formData.userName} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Rol</label>
            <input type="text" name="rol" value={formData.rol} onChange={handleChange} className={styles.formInput} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Foto de perfil (URL)</label>
            <input type="text" name="urlPicture" value={formData.urlPicture ?? ''} onChange={handleChange} className={styles.formInput} />
          </div>
        </form>
      )}
    </DetailModal>
  );
};

export default UserDetailModal;