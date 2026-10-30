export type NotificationType = 'error' | 'success' | 'info' | 'warning';
export type AppNotification = { id: string; type: NotificationType; message: string };

let items: AppNotification[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const notifier = {
  push(type: NotificationType, message: string, ms = 5000) {
    const id = crypto.randomUUID();
    items = [...items, { id, type, message }];
    emit();
    setTimeout(() => notifier.dismiss(id), ms);
  },
  error: (m: string) => notifier.push('error', m),
  success: (m: string) => notifier.push('success', m),
  info: (m: string) => notifier.push('info', m),
  warning: (m: string) => notifier.push('warning', m),
  dismiss(id: string) {
    items = items.filter((n) => n.id !== id);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => items,
};