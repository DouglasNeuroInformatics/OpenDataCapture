import type { PropsWithChildren } from 'react';

import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import { act, cleanup, fireEvent, renderHook, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useConfirmPermissionSetDeletion } from '../useConfirmPermissionSetDeletion';

import '@/services/i18n';

const deleteMutate = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useDeletePermissionSetMutation', () => ({
  useDeletePermissionSetMutation: () => ({ mutate: deleteMutate })
}));

const PERMISSION_SET = { holderCount: 3, id: 'set-1', name: 'Research Assistant' };

const renderConfirm = () => {
  const wrapper = ({ children }: PropsWithChildren) => <CoreProvider>{children}</CoreProvider>;
  return renderHook(() => useConfirmPermissionSetDeletion(), { wrapper }).result;
};

const confirmation = () => screen.getByTestId('destructive-action-dialog');

describe('useConfirmPermissionSetDeletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // libui queues confirmations in a module-level store, so one left open would greet the next test.
    const dialog = screen.queryByTestId('destructive-action-dialog');
    if (dialog) {
      fireEvent.click(within(dialog).getByRole('button', { name: 'No' }));
    }
    cleanup();
  });

  it.each([
    [0, 'No user holds this permission set, so deleting it changes no one’s permissions.'],
    [1, '1 user holds this permission set. Deleting it removes it from them'],
    [3, '3 users hold this permission set. Deleting it removes it from them']
  ])(
    'should tell the admin how %i holders are affected, since deleting takes the set from each',
    (holderCount, wording) => {
      const result = renderConfirm();
      act(() => result.current({ ...PERMISSION_SET, holderCount }));
      expect(confirmation().textContent).toContain('Delete the permission set "Research Assistant"?');
      expect(confirmation().textContent).toContain(wording);
      expect(deleteMutate).not.toHaveBeenCalled();
    }
  );

  it('should delete the set once confirmed, then report it deleted', () => {
    const onDeleted = vi.fn();
    const result = renderConfirm();
    act(() => result.current(PERMISSION_SET, { onDeleted }));
    fireEvent.click(within(confirmation()).getByRole('button', { name: 'Yes' }));
    expect(deleteMutate).toHaveBeenCalledWith({ id: 'set-1' }, { onSuccess: onDeleted });
  });

  it('should leave the set alone when the admin declines', () => {
    const result = renderConfirm();
    act(() => result.current(PERMISSION_SET));
    fireEvent.click(within(confirmation()).getByRole('button', { name: 'No' }));
    expect(deleteMutate).not.toHaveBeenCalled();
  });
});
