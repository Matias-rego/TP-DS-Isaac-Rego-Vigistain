import { useState, useEffect } from "react";
import DetailModal from "../Modals/DetailModal";
import type { DetailFieldConfig, DetailItemConfig } from "../Modals/DetailModal";
import styles from './UserDetailModal.module.css';
import { eventBus } from "@/lib/eventBus";
import ActionButton from "../Common/Buttons/ActionButton";
import ConfirmDialog from "../Common/ConfirmDialog/ConfirmDialog";
import type { User as UserBase } from '@/features/users/types';
import AlertSuccess from '@/components/Alert/AlertSuccess';
import { api, getFieldErrors, notifyIfNeeded } from "@/api/client";
import { notifier } from '@/notifications/notifier';
interface User extends UserBase {
  onClick?: (id: string) => void;
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
  const [confirmBaja, setConfirmBaja] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    setFormValidate(user);
  }, [user]);
  useEffect(() => {
    if (!open) {
      setIsUpgrading(false);
      setSuccessMessage(null);
    }
  }, [open]);

  const handleEdit = async (updatedUser: User)=> {
    try {
      const { id_user, status, ...payload } = updatedUser;

      const updated = await api<User>(
        `/api/users/${id_user}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );
      if (entityEvent) eventBus.emit(entityEvent, updated);
      if(updated){
        notifier.success("Usuario actualizado con exito");
      }
      return true;
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if(Object.keys(fieldErrors).length > 0){
        notifier.error(Object.values(fieldErrors).join('. '));
      }else{
        notifyIfNeeded(error, "No se pudo actualizar el usuario");
      }
    }
  };

  const handleValidate = async () => {
    const exito = await handleEdit({ ...user, validationStatus: true });
    if (exito) setSuccessMessage("Usuario validado con éxito.");
  };

  const handleConfirmUpgrade = async () => {
    const exito = await handleEdit({ ...formValidate, rol: 'admin' });
    if (exito) {
      setIsUpgrading(false);
      setSuccessMessage("Usuario ascendido a administrador con éxito.");
    }
  };

  const doBaja = async () => {
    setConfirmBaja(false);
    try {
      const response = await api<User>(
        `/api/users/${user.id_user}`,
        { method: 'DELETE' }
      );
      if (entityEvent) eventBus.emit(entityEvent, response);
      onClose();
    } catch (error) {
      notifyIfNeeded(error, "No se pudo dar de baja al usuario");
    }
  };

  return (
    <>
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
          : (user.status === true
              ? [
                  {
                    label: "Dar de baja",
                    variant: "danger",
                    onClick: () => setConfirmBaja(true),
                  },
                ]
              : [])
      }
    >
      {successMessage && <AlertSuccess message={successMessage} />}
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

    <ConfirmDialog
      open={confirmBaja}
      danger
      title="Dar de baja usuario"
      message="El usuario quedará inactivo y no podrá iniciar sesión. ¿Continuar?"
      confirmLabel="Dar de baja"
      onConfirm={doBaja}
      onCancel={() => setConfirmBaja(false)}
    />
    </>
  );
};

export default UserDetailModal;