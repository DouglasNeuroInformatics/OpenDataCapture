import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateSubjectIdentificationSettingsMutation } from '../useUpdateSubjectIdentificationSettingsMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), put: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const definition = {
  fields: [{ label: { en: 'Animal ID' }, pattern: '[0-9]+' }],
  label: { en: 'Animal information' }
};

const savedSettings = {
  customFields: { ...definition, iterations: 600_000, salt: 'ab'.repeat(32) },
  isCustomFieldsLocked: false
};

function renderUpdateMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(QueryClientProvider, { children, client: queryClient });
  };
  return { ...renderHook(() => useUpdateSubjectIdentificationSettingsMutation(), { wrapper }), queryClient };
}

describe('useUpdateSubjectIdentificationSettingsMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.put.mockResolvedValue({ data: savedSettings });
  });

  it('should put the settings without raising the default error toast, since the tab says why a save failed', async () => {
    const { result } = renderUpdateMutation();
    await result.current.mutateAsync({ customFields: definition });
    expect(mockAxios.put).toHaveBeenCalledWith(
      '/v1/subjects/identification/settings',
      { customFields: definition },
      { meta: { disableDefaultErrorNotification: true } }
    );
  });

  // The tab asks for confirmation only while no definition is stored, so the cache must hold the
  // saved definition as soon as the first save returns.
  it('should seed the settings cache from the response', async () => {
    const { queryClient, result } = renderUpdateMutation();
    await result.current.mutateAsync({ customFields: definition });
    expect(queryClient.getQueryData(['subject-identification-settings'])).toStrictEqual(savedSettings);
  });
});
