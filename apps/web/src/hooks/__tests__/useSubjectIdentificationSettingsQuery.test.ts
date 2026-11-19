import type { PropsWithChildren } from 'react';
import { createElement, Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubjectIdentificationSettingsQuery } from '../useSubjectIdentificationSettingsQuery';

const mockAxios = vi.hoisted(() => ({ get: vi.fn(), isAxiosError: vi.fn(() => false) }));

vi.mock('axios', () => ({ default: mockAxios }));

const settings = {
  customFields: {
    fields: [{ label: { en: 'Animal ID' }, pattern: '[0-9]+' }],
    iterations: 600_000,
    label: { en: 'Animal information' },
    salt: 'ab'.repeat(32)
  },
  isCustomFieldsLocked: false,
  offeredMethods: ['CUSTOM_ID', 'PERSONAL_INFO']
};

function renderSettingsQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(Suspense, { fallback: null }, children)
    );
  };
  return renderHook(() => useSubjectIdentificationSettingsQuery(), { wrapper });
}

describe('useSubjectIdentificationSettingsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: settings });
  });

  it('should request the settings and parse them at the boundary', async () => {
    const { result } = renderSettingsQuery();
    await waitFor(() => expect(result.current?.data).toStrictEqual(settings));
    expect(mockAxios.get).toHaveBeenCalledWith('/v1/subjects/identification/settings');
  });
});
