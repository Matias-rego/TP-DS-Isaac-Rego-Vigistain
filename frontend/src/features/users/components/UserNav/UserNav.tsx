import { BadgeCheck, Clock, Pencil } from "lucide-react";
import type { User } from "@/features/users/types";
import styles from "./UserNav.module.css";

interface UserNavProps {
  user: User;
  onEdit?: () => void;
  onChangePassword?: () => void;
}

const UserNav = ({ user, onEdit }: UserNavProps) => {
  return (
    <header className={styles.card}>
      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          {user.urlPicture ? (
            <img
              src={user.urlPicture}
              alt={`Foto de ${user.userName}`}
              className={styles.avatar}
            />
          ) : (
            <div className={`${styles.avatar} ${styles.avatarFallback}`}>
              {user.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={`${styles.status} ${user.status ? styles.active : styles.inactive}`}>
            {user.status ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{user.userName}</h1>
            <span className={styles.role}>{user.rol}</span>
          </div>

          {user.validationStatus !== undefined && (
            <span className={`${styles.validation} ${user.validationStatus ? styles.valid : styles.pending}`}>
              {user.validationStatus ? (
                <BadgeCheck size={14} aria-hidden="true" />
              ) : (
                <Clock size={14} aria-hidden="true" />
              )}
              {user.validationStatus ? "Cuenta validada" : "Pendiente de validación"}
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={onEdit}>
          <Pencil size={16} aria-hidden="true" />
          Editar perfil
        </button>
      </div>
    </header>
  );
};

export default UserNav;