import type { PropsWithChildren } from 'react';
import { createElement } from 'react';

import { MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSendBulkAssignmentEmailMutation } from '../useSendBulkAssignmentEmailMutation';

const mockAxios = vi.hoisted(() => ({ isAxiosError: vi.fn(() => false), post: vi.fn() }));

vi.mock('axios', () => ({ default: mockAxios }));

const delivered = { message: 'rendered', recipient: 'p@x.org', status: 'SENT' };

function renderSendMutation() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { children, client: queryClient });
  return renderHook(() => useSendBulkAssignmentEmailMutation(), { wrapper });
}

describe('useSendBulkAssignmentEmailMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: delivered });
  });

  it('should post every link for one recipient to the bulk endpoint and parse the delivery result', async () => {
    const { result } = renderSendMutation();
    const outcome = await result.current.mutateAsync({
      assignmentIds: ['assignment-1', 'assignment-2'],
      language: 'en',
      recipient: 'p@x.org',
      templateId: null
    });
    expect(outcome).toEqual(delivered);
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/assignments/bulk/email',
      { assignmentIds: ['assignment-1', 'assignment-2'], language: 'en', recipient: 'p@x.org', templateId: null },
      { meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }, timeout: MAIL_CLIENT_TIMEOUT }
    );
  });

  // A failure is rendered where the operator is looking, so it must reach the caller as a rejection
  // rather than the router's error boundary.
  it('should reject rather than escalate when the request fails', async () => {
    mockAxios.post.mockRejectedValue(new Error('network'));
    const { result } = renderSendMutation();
    await expect(
      result.current.mutateAsync({ assignmentIds: ['assignment-1'], language: 'en', recipient: 'p@x.org' })
    ).rejects.toThrow('network');
  });
});
