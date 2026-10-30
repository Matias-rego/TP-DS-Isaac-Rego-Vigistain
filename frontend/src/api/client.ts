import { notifier } from '@/notifications/notifier';
import BACKEND_URL from '@/lib/config';

export class ApiError extends Error {
  notified = false;
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

type Options = RequestInit & {
  silent?: boolean;        // no mostrar notificación
  authRedirect?: boolean;  // false en el login: un 401 acá es "credenciales incorrectas"
};

export async function api<T>(
  path: string, // ahora con prefijo: '/api/orders'
  { silent, authRedirect = true, ...init }: Options = {},
): Promise<T> {
  const headers: HeadersInit = {
    ...(init.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...init.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, { credentials: 'include', ...init, headers });
  } catch {
    const e = new ApiError('NETWORK_ERROR', 'No se pudo conectar con el servidor', 0);
    if (!silent) {
      notifier.error(e.message);
      e.notified = true;
    }
    throw e;
  }

  if (res.ok) {
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const body = await res.json().catch(() => null);
  const err = new ApiError(
    body?.error?.code ?? 'UNKNOWN',
    body?.error?.message ?? 'Ocurrió un error inesperado',
    res.status,
    body?.error?.details,
    body?.error?.requestId,
  );

  if (err.status === 401 && authRedirect) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    err.notified = true; // la redirección ya es la respuesta; no mostrar toast
  } else if (!silent && err.code !== 'VALIDATION_ERROR') {
    notifier.error(err.message);
    err.notified = true;
  }
  throw err;
}