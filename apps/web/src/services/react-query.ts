import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      throwOnError: true
    },
    queries: {
      // Transient network failures are retried in the axios layer (services/axios.ts); disabling React
      // Query's own retry avoids compounding the two into excessive requests on a flaky connection, and
      // there is no value in retrying genuine (non-transient) errors.
      retry: false,
      throwOnError: true
    }
  }
});
