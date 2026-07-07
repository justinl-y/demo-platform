import { QueryClient } from '@tanstack/react-query';

// Shared across the QueryClientProvider (main.tsx) and the router context (route guards call
// ensureQueryData against it), so both read/write the same cache.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
