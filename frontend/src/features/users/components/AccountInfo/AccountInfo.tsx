import type { ReactNode } from "react";
import { Check, Copy, UserRound } from "lucide-react";
import { notifier } from "@/notifications/notifier";
import styles from "./AccountInfo.module.css";

interface AccountInfoProps {
  id: string;
  email: string;
  rol: string;
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    <div className={styles.box}>{children}</div>
  </div>
);

const AccountInfo = ({ id, email, rol}: AccountInfoProps) => {
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      notifier.success("ID copiado");
    } catch {
      notifier.error("No se pudo copiar el ID");
    }
  };


  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <UserRound size={20} className={styles.headerIcon} aria-hidden="true" />
        <h2 className={styles.title}>Información de cuenta</h2>
      </header>

      <Field label="Identificador interno">
        <span className={styles.mono}>{id}</span>
        <button type="button" className={styles.iconBtn} onClick={copyId} aria-label="Copiar ID">
          <Copy size={16} aria-hidden="true" />
        </button>
      </Field>

      <Field label="Correo electrónico">
        <span className={styles.text}>{email}</span>
        <Check size={16} className={styles.ok} aria-hidden="true" />
      </Field>

      <Field label="Rol asignado">
        <span className={styles.mono}>{rol}</span>
      </Field>

      {/* <div className={styles.pair}>
        <Field label="Teléfono">
          <span className={styles.text}>{phone || "—"}</span>
        </Field>
        <Field label="Fecha de alta">
          <span className={styles.text}>{registered}</span>
        </Field>
      </div> */}
    </section>
  );
};

export default AccountInfo;