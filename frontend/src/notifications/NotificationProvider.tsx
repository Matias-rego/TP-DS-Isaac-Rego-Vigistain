import { useSyncExternalStore, type ReactNode } from 'react';
import { notifier, type NotificationType } from './notifier';
import styles from './NotificationProvider.module.css';

const LABELS: Record<NotificationType, string> = {
  error: 'Error',
  success: 'Listo',
  warning: 'Atención',
  info: 'Información',
};

const svgProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const ICONS: Record<NotificationType, ReactNode> = {
  error: (
    <svg {...svgProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  success: (
    <svg {...svgProps}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  warning: (
    <svg {...svgProps}>
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg {...svgProps}>
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="12" y1="7" x2="12.01" y2="7" />
    </svg>
  ),
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(notifier.subscribe, notifier.getSnapshot);

  return (
    <>
      {children}
      <div className={styles.container}>
        {items.map((n) => (
          <div
            key={n.id}
            // error y warning interrumpen al lector de pantalla; el resto se anuncia con calma
            role={n.type === 'error' || n.type === 'warning' ? 'alert' : 'status'}
            className={`${styles.toast} ${styles[n.type]}`}
          >
            <div className={styles.iconWrap}>{ICONS[n.type]}</div>

            <div className={styles.body}>
              <p className={styles.title}>{LABELS[n.type]}</p>
              <p className={styles.message}>{n.message}</p>
            </div>

            <button
              type="button"
              className={styles.close}
              onClick={() => notifier.dismiss(n.id)}
              aria-label="Cerrar notificación"
            >
              <svg {...svgProps} width={14} height={14}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}