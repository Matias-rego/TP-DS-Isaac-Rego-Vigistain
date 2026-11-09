// import { Check, History, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { Check, ShieldCheck } from "lucide-react";
// import DescriptiveMiniCard from "@/components/Common/Cards/DescriptiveMiniCard/DescriptiveMiniCard";
import type { User } from "@/features/users/types";
import UserNav from "@/features/users/components/UserNav/UserNav";
import AccountInfo from "@/features/users/components/AccountInfo/AccountInfo";
import styles from "./UserProfile.module.css";

// Permisos hardcodeados (por ahora iguales para cualquier rol)
const TECH_PERMISSIONS = [
  {
    code: "001",
    title: "Diagnóstico y triaje",
    description: "Reclasificación técnica y derivación a bancos de trabajo en taller.",
  },
  {
    code: "002",
    title: "Aprobación de cotización",
    description: "Autorización directa de repuestos y órdenes de componentes hasta USD 1.500.",
  },
  {
    code: "003",
    title: "Cierre y garantía",
    description: "Emisión de certificados, auditoría de pruebas de banco y dictamen final de reparación.",
  }
];
const ADMIN_PERMISSIONS = [
  {
    code: "001",
    title: "Diagnóstico y triaje",
    description: "Reclasificación técnica y derivación a bancos de trabajo en taller.",
  },
  {
    code: "002",
    title: "Aprobación de cotización",
    description: "Autorización directa de repuestos y órdenes de componentes hasta USD 1.500.",
  },
  {
    code: "003",
    title: "Cierre y garantía",
    description: "Emisión de certificados, auditoría de pruebas de banco y dictamen final de reparación.",
  },
  {
    code: "004",
    title: "Administración de Usuarios",
    description: "Validación de nuevos usuarios, asignación de roles y permisos, y gestión de cuentas.",
  },
];

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
  onChangePassword?: () => void;
}

const UserProfile = ({ user, onEdit, onChangePassword }: UserProfileProps) => {
  const permissions = user.rol === "tecnico" ? TECH_PERMISSIONS : ADMIN_PERMISSIONS;
  return (
    <div className={styles.page}>

      <main className={styles.main}>
        <UserNav user={user} onEdit={onEdit} onChangePassword={onChangePassword} />

        <div className={styles.cards}>
          {/* <DescriptiveMiniCard
            label="Órdenes asignadas"
            value={user.orders?.length ?? 0}
            icon={Wrench}
            tone="neutral"
          />
          <DescriptiveMiniCard
            label="Estado de la cuenta"
            value={user.status ? "Activa" : "Inactiva"}
            icon={UserCheck}
            tone={user.status ? "success" : "danger"}
          />
          <DescriptiveMiniCard
            label="Intervenciones"
            value={user.statusHistory?.length ?? 0}
            icon={History}
            tone="neutral"
          /> */}
        </div>

        <div className={styles.bottom}>
          <AccountInfo id={user.id_user} email={user.email} rol={user.rol} />

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <ShieldCheck size={20} className={styles.panelIcon} aria-hidden="true" />
                Permisos activos de rol
                <span className={styles.roleChip}>{user.rol}</span>
              </h2>
              <span className={styles.count}>{user.rol === "tecnico" ? TECH_PERMISSIONS.length : ADMIN_PERMISSIONS.length} activos</span>
            </header>

            <ul className={styles.permList}>
              {permissions.map((permission) => (
                <li key={permission.code} className={styles.perm}>
                  <span className={styles.permIcon}>
                    <Check size={16} aria-hidden="true" />
                  </span>

                  <div className={styles.permBody}>
                    <p className={styles.permTitle}>{permission.title}</p>
                    <p className={styles.permText}>{permission.description}</p>
                  </div>

                  <span className={styles.permCode}>{permission.code}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

    </div>
  );
};

export default UserProfile;