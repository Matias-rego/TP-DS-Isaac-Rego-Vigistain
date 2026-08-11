import { useState, useEffect } from "react";
import DetailModal from "../Modals/DetailModal";
import type { DetailFieldConfig, DetailItemConfig, DetailModalAction } from "../Modals/DetailModal";
import styles from './UserDetailModal.module.css';
import { eventBus } from "@/lib/eventBus";
import { BACKEND_URL } from "@/lib/config";
import ActionButton from "../Buttons/ActionButton";

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

interface OrderSummary {
  id: string;
  status: string;
  date?: string;
}

const userFields: DetailFieldConfig<User>[] = [
  { name: 'userName', label: 'Nombre de usuario' },
  { name: 'email',    label: 'Email' },
  { name: 'rol',      label: 'Rol' },
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
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [formValidate, setFormValidate] = useState<User>(user);

  useEffect(() => {
    setFormValidate(user);
  }, [user]);
  useEffect(() => {
    if (!open) {
      setIsUpgrading(false);
    }
  }, [open]);

  const handleEdit = async (updatedUser: User): Promise<boolean> => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/users/${updatedUser.id_user}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorValidate = await response.json().catch(() => ({}));
        throw new Error(errorValidate.message || `Error del servidor: ${response.status}`);
      }

      const result = await response.json();

      if (entityEvent) eventBus.emit(entityEvent, result);

      return true;
    } catch (error) {
      console.error('Error al editar usuario:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
      return false;
    }
  };

  const handleValidate = async () => {
    await handleEdit({ ...user, validationStatus: true });
  };

  const handleConfirmUpgrade = async () => {
    const exito = await handleEdit({ ...formValidate, rol: 'admin' });
    if (exito) {
      setIsUpgrading(false);
    }
  };

  return (
    <DetailModal
      open={open}
      onClose={() => {
        setIsUpgrading(false);
        onClose();
      }}
      title={isUpgrading ? "Confirmar Ascenso" : "Detalle de Usuario"}
      data={user}
      fields={isUpgrading ? [] : userFields}
      statusField="status"
      statusLabel={(value) => (value === true ? "Activo" : "Inactivo")}
      statusTone={(value) => (value === true ? "active" : "inactive")}
      listTitle="Pedidos asociados"
      items={isUpgrading ? [] : orders}
      itemConfig={isUpgrading ? undefined : orderItemConfig}
      cancelLabel={isUpgrading ? "Cancelar" : "Cerrar"}
      onCancel={() => {
        if (isUpgrading) {
          setIsUpgrading(false);
        } else {
          onClose();
        }
      }}
      actions={
        isUpgrading
          ? [
              {
                label: "Confirmar Ascenso",
                variant: "primary",
                onClick: handleConfirmUpgrade,
              },
            ]
          : []
      }
    >
      {user.validationStatus === false && !isUpgrading && (
        <ActionButton
        label="Validar Usuario"
        onClick={handleValidate}
        icon={null}
        variant="neutral"
        />
      )}
      {!isUpgrading && user.validationStatus === true && user.rol !== 'admin' && (
        <ActionButton
        label="Ascender a Administrador"
        onClick={()=> setIsUpgrading(true)}
        icon={null}
        variant="neutral"
        />
      )}
      {isUpgrading && (
        <h1 className={styles.editingHeader}>Presione en confirmar ascenso para otorgarle todas las facultades correspondientes de un administrador al usuario {user.userName}.</h1>
      )}
    </DetailModal>
  );
};

export default UserDetailModal;