// Tarjeta.tsx
import type { JSX } from 'react';
import styles from './TarjetaTrabajos.module.css';

// ── Tipos ────────────────────────────────────────────────────────
export type EstadoTarjeta = 'reparado' | 'pendiente' | 'en_proceso' | 'presupuesto' | 'cancelado';

interface TarjetaProps {
  titulo:       string;
  subtitulo:    string;
  estado:       EstadoTarjeta;
  footerLabel:  string;
  footerValue:  string;
  onClick?:     () => void;
}

// ── Config por estado ────────────────────────────────────────────
const estadoConfig: Record<EstadoTarjeta, { label: string; className: string; icono: JSX.Element }> = {
  reparado: {
    label: 'Reparado',
    className: styles.green,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  pendiente: {
    label: 'Pendiente',
    className: styles.amber,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  en_proceso: {
    label: 'En proceso',
    className: styles.blue,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  presupuesto: {
    label: 'Presupuesto',
    className: styles.gray,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  cancelado: {
    label: 'Cancelado',
    className: styles.coral,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

// ── Componente ───────────────────────────────────────────────────
const TarjetaTrabajos = ({ titulo, subtitulo, estado, footerLabel, footerValue, onClick }: TarjetaProps) => {
  const config = estadoConfig[estado];
  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ''}`} onClick={onClick}>

      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${config.className}`}>
          {config.icono}
        </div>
        <span className={`${styles.badge} ${config.className}`}>
          {config.label}
        </span>
      </div>

      <p className={styles.titulo}>{titulo}</p>
      <p className={styles.subtitulo}>{subtitulo}</p>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>{footerLabel}</span>
        <span className={styles.footerValue}>{footerValue}</span>
      </div>

    </div>
  );
};

export default TarjetaTrabajos;