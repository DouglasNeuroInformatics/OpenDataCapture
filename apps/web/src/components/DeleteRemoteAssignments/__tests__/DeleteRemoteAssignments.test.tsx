import React from 'react';

import type { Assignment } from '@opendatacapture/schemas/assignment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { DeleteRemoteAssignments } from '@/components/DeleteRemoteAssignments';

import '@/services/i18n';

type DeleteMutationOptions = { onSuccess: () => void };

type MockState = {
  assignments?: Assignment[];
  deleteMutate: Mock<(variables: { ids: string[] }, options: DeleteMutationOptions) => void>;
  instrumentInfo?: { details: { title: string }; id: string }[];
  isPending: boolean;
};

const mocks = vi.hoisted(() => {
  const state: MockState = { deleteMutate: vi.fn(), isPending: false };
  return state;
});

vi.mock('@/hooks/useAssignmentsQuery', () => ({
  ASSIGNMENTS_QUERY_KEY_PREFIX: 'assignments',
  assignmentsQueryOptions: () => ({}),
  useAssignmentsQuery: () => ({ data: mocks.assignments })
}));

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({
    data: mocks.instrumentInfo
  })
}));

vi.mock('@/hooks/useDeleteBulkAssignmentsMutation', () => ({
  useDeleteBulkAssignmentsMutation: () => ({
    isPending: mocks.isPending,
    mutate: mocks.deleteMutate
  })
}));

const makeAssignment = (overrides: Partial<Assignment> & Pick<Assignment, 'id'>): Assignment => ({
  completedAt: null,
  createdAt: new Date('2026-01-01'),
  expiresAt: new Date('2027-01-01'),
  instrumentId: 'i-1',
  status: 'OUTSTANDING',
  subjectId: `root$${overrides.id}`,
  updatedAt: new Date('2026-01-01'),
  url: 'https://gateway.example.org/assignments/1',
  ...overrides
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const renderComponent = (props: Partial<React.ComponentProps<typeof DeleteRemoteAssignments>> = {}) => {
  const onBack = vi.fn();
  const result = render(
    <DeleteRemoteAssignments groupId="group-1" subjectIdDisplayLength={9} onBack={onBack} {...props} />,
    { wrapper }
  );
  return { ...result, onBack };
};

const rowCheckbox = (id: string) => screen.getByTestId(`delete-select-assignment-${id}`);
const selectAllCheckbox = () => screen.getByTestId('delete-select-all-assignments');
const deleteSelectedButton = () => screen.getByTestId<HTMLButtonElement>('delete-selected-assignments');
const confirmButton = () => screen.getByTestId<HTMLButtonElement>('confirm-delete-assignments');
const isChecked = (element: HTMLElement) => element.getAttribute('aria-checked') === 'true';

const renderedRowIds = () =>
  screen
    .getAllByTestId(/^delete-select-assignment-/)
    .map((element) => element.getAttribute('data-testid')!.replace('delete-select-assignment-', ''));

const openConfirmation = (...ids: string[]) => {
  ids.forEach((id) => fireEvent.click(rowCheckbox(id)));
  fireEvent.click(deleteSelectedButton());
};

beforeEach(() => {
  cleanup();
  vi.resetAllMocks();
  mocks.assignments = [];
  mocks.instrumentInfo = [];
  mocks.isPending = false;
});

describe('DeleteRemoteAssignments', () => {
  it('should show an empty state when there are no deletable assignments', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1', status: 'COMPLETE' })];
    renderComponent();
    expect(screen.getByText(/no outstanding or expired/i)).toBeTruthy();
    expect(screen.queryByTestId('delete-selected-assignments')).toBeNull();
  });

  it('should show the empty state while the assignments and instruments are still loading', () => {
    mocks.assignments = undefined;
    mocks.instrumentInfo = undefined;
    renderComponent();
    expect(screen.getByText(/no outstanding or expired/i)).toBeTruthy();
  });

  it('should list outstanding and expired assignments', () => {
    mocks.assignments = [
      makeAssignment({ id: 'a-1', status: 'OUTSTANDING' }),
      makeAssignment({ id: 'a-2', status: 'EXPIRED' }),
      makeAssignment({ id: 'a-3', status: 'COMPLETE' }),
      makeAssignment({ id: 'a-4', status: 'CANCELED' })
    ];
    mocks.instrumentInfo = [{ details: { title: 'Test Instrument' }, id: 'i-1' }];
    renderComponent();
    expect(screen.getAllByText('Test Instrument')).toHaveLength(2);
    expect(renderedRowIds()).toEqual(['a-1', 'a-2']);
  });

  it('should label each row with its status', () => {
    mocks.assignments = [
      makeAssignment({ id: 'a-1', status: 'OUTSTANDING' }),
      makeAssignment({ id: 'a-2', status: 'EXPIRED' })
    ];
    renderComponent();
    expect(screen.getByText('Outstanding')).toBeTruthy();
    expect(screen.getByText('Expired')).toBeTruthy();
  });

  it('should fall back to the instrument id when its details are unavailable', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1', instrumentId: 'unknown-instrument' })];
    renderComponent();
    expect(screen.getByTitle('unknown-instrument')).toBeTruthy();
  });

  it('should show the subject id without its group scope, cut to the display length', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1', subjectId: 'group-1$abcdefghijkl' })];
    renderComponent({ subjectIdDisplayLength: 4 });
    expect(rowCheckbox('a-1').getAttribute('aria-label')).toBe('abcd');
  });

  it('should sort by a column ascending, then descending, as its header is clicked', () => {
    mocks.assignments = [makeAssignment({ id: 'b' }), makeAssignment({ id: 'a' }), makeAssignment({ id: 'c' })];
    renderComponent();
    const subjectHeader = screen.getByText('Subject').closest('button')!;
    fireEvent.click(subjectHeader);
    expect(renderedRowIds()).toEqual(['a', 'b', 'c']);
    fireEvent.click(subjectHeader);
    expect(renderedRowIds()).toEqual(['c', 'b', 'a']);
  });

  it('should disable the delete button when nothing is selected', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    expect(deleteSelectedButton().disabled).toBe(true);
  });

  it('should select an assignment when its row is clicked, and count it on the delete button', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    fireEvent.click(screen.getByTitle('i-1'));
    expect(isChecked(rowCheckbox('a-1'))).toBe(true);
    expect(deleteSelectedButton().textContent).toBe('Delete Selected (1)');
  });

  it('should deselect an assignment when its checkbox is clicked again', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    fireEvent.click(rowCheckbox('a-1'));
    fireEvent.click(rowCheckbox('a-1'));
    expect(isChecked(rowCheckbox('a-1'))).toBe(false);
    expect(deleteSelectedButton().disabled).toBe(true);
  });

  it('should select every shown assignment from the header, then clear them on a second click', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' }), makeAssignment({ id: 'a-2' })];
    renderComponent();
    fireEvent.click(selectAllCheckbox());
    expect(isChecked(selectAllCheckbox())).toBe(true);
    expect(deleteSelectedButton().textContent).toBe('Delete Selected (2)');
    fireEvent.click(selectAllCheckbox());
    expect(isChecked(selectAllCheckbox())).toBe(false);
    expect(deleteSelectedButton().disabled).toBe(true);
  });

  it('should select only the assignments matching the search, so hidden rows are never deleted by accident', () => {
    mocks.assignments = [
      makeAssignment({ id: 'a-1', subjectId: 'root$alpha' }),
      makeAssignment({ id: 'a-2', subjectId: 'root$bravo' })
    ];
    renderComponent();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'alpha' } });
    fireEvent.click(selectAllCheckbox());
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    expect(isChecked(rowCheckbox('a-1'))).toBe(true);
    expect(isChecked(rowCheckbox('a-2'))).toBe(false);
  });

  it('should leave the selection alone when the search matches nothing', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1', subjectId: 'root$alpha' })];
    renderComponent();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zulu' } });
    fireEvent.click(selectAllCheckbox());
    expect(isChecked(selectAllCheckbox())).toBe(false);
    expect(deleteSelectedButton().disabled).toBe(true);
  });

  it('should open a confirmation dialog when the delete button is clicked', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    openConfirmation('a-1');
    expect(confirmButton()).toBeTruthy();
  });

  it.each([
    [['a-1'], 'Delete 1 assignment? This cannot be undone.'],
    [['a-1', 'a-2'], 'Delete 2 assignments? This cannot be undone.']
  ])('should state how many assignments will be deleted (%j)', (ids, message) => {
    mocks.assignments = [makeAssignment({ id: 'a-1' }), makeAssignment({ id: 'a-2' })];
    renderComponent();
    openConfirmation(...ids);
    expect(screen.getByText(message)).toBeTruthy();
  });

  it('should close the dialog without deleting when cancelled', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    openConfirmation('a-1');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('confirm-delete-assignments')).toBeNull();
    expect(mocks.deleteMutate).not.toHaveBeenCalled();
  });

  it('should call the delete mutation with selected ids on confirmation', () => {
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    openConfirmation('a-1');
    fireEvent.click(confirmButton());
    expect(mocks.deleteMutate).toHaveBeenCalledTimes(1);
    expect(mocks.deleteMutate.mock.lastCall?.[0]).toEqual({ ids: ['a-1'] });
  });

  it('should clear the selection, close the dialog and go back once the deletion succeeds', () => {
    mocks.deleteMutate.mockImplementation((_, options) => options.onSuccess());
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    const { onBack } = renderComponent();
    openConfirmation('a-1');
    fireEvent.click(confirmButton());
    expect(screen.queryByTestId('confirm-delete-assignments')).toBeNull();
    expect(deleteSelectedButton().disabled).toBe(true);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should stay on the page after a successful deletion when there is nowhere to go back to', () => {
    mocks.deleteMutate.mockImplementation((_, options) => options.onSuccess());
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent({ onBack: undefined });
    openConfirmation('a-1');
    fireEvent.click(confirmButton());
    expect(screen.getByTestId('delete-remote-assignments')).toBeTruthy();
    expect(screen.queryByTestId('confirm-delete-assignments')).toBeNull();
  });

  it('should go back when the back button is clicked', () => {
    const { onBack } = renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should hide the back button when there is nowhere to go back to', () => {
    renderComponent({ onBack: undefined });
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('should disable confirmation while a deletion is in flight, so it is not submitted twice', () => {
    mocks.isPending = true;
    mocks.assignments = [makeAssignment({ id: 'a-1' })];
    renderComponent();
    openConfirmation('a-1');
    expect(confirmButton().disabled).toBe(true);
    expect(confirmButton().textContent).toBe('Deleting…');
  });
});
