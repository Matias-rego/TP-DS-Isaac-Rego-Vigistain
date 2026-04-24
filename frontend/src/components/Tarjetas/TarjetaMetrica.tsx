// TarjetaMetrica.tsx
import styles from './TarjetaMetrica.module.css';

// ── Tipos ────────────────────────────────────────────────────────
interface TarjetaMetricaProps {
  label:    string;           // "Reparaciones totales"
  valor:    string | number;  // 10 | "$148k" | "2.4"
  sub?:     string;           // "Esta semana" (opcional)
}

// ── Componente ───────────────────────────────────────────────────
const TarjetaMetrica = ({ label, valor, sub }: TarjetaMetricaProps) => {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.valor}>{valor}</p>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  );
};

export default TarjetaMetrica;