import { useSyncExternalStore, type ReactNode } from 'react';
import { notifier } from './notifier';

const colors = {
  error: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  info: '#2563eb',
} as const;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(notifier.subscribe, notifier.getSnapshot);
  return (
    <>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
        }}
      >
        {items.map((n) => (
          <div
            key={n.id}
            role="alert"
            style={{
              background: colors[n.type], color: '#fff', padding: '10px 14px',
              borderRadius: 8, display: 'flex', justifyContent: 'space-between',
              gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,.25)',
            }}
          >
            <span>{n.message}</span>
            <button
              onClick={() => notifier.dismiss(n.id)}
              aria-label="Cerrar"
              style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}