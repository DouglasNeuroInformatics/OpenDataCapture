import { describe, expect, it } from 'vitest';

import { queryClient } from '@/services/react-query';

describe('queryClient', () => {
  it('should not retry failed queries, since the axios layer already retries transient failures', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('should throw query errors, so they reach the route error boundary', () => {
    expect(queryClient.getDefaultOptions().queries?.throwOnError).toBe(true);
  });

  it('should throw mutation errors, so they reach the route error boundary', () => {
    expect(queryClient.getDefaultOptions().mutations?.throwOnError).toBe(true);
  });
});
