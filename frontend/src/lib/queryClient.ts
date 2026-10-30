import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/client';
import { notifier } from '@/notifications/notifier';

const handleError = (error: unknown) => {
  if (error instanceof ApiError) return; 
  notifier.error('Ocurrió un error inesperado'); 
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
  },
});