import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteRemoteAssignments } from '@/components/DeleteRemoteAssignments';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  assignments: [] as any[],
  deleteMutate: vi.fn(),
  instrumentInfo: [] as any[]
}));

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
    isPending: false,
    mutate: mocks.deleteMutate
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const renderComponent = (props: Partial<React.ComponentProps<typeof DeleteRemoteAssignments>> = {}) =>
  render(<DeleteRemoteAssignments groupId="group-1" subjectIdDisplayLength={9} onBack={vi.fn()} {...props} />, {
    wrapper
  });

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.assignments = [];
  mocks.instrumentInfo = [];
});

describe('DeleteRemoteAssignments', () => {
  it('should show an empty state when there are no deletable assignments', () => {
    mocks.assignments = [
      {
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        id: 'a-1',
        instrumentId: 'i-1',
        status: 'COMPLETE',
        subjectId: 'subject-1'
      }
    ];
    renderComponent();
    expect(screen.getByText(/no outstanding or expired/i)).toBeTruthy();
  });

  it('should list outstanding and expired assignments', () => {
    mocks.assignments = [
      {
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        id: 'a-1',
        instrumentId: 'i-1',
        status: 'OUTSTANDING',
        subjectId: 'subject-1'
      },
      {
        createdAt: new Date('2025-01-01'),
        expiresAt: new Date('2025-06-01'),
        id: 'a-2',
        instrumentId: 'i-1',
        status: 'EXPIRED',
        subjectId: 'subject-2'
      },
      {
        createdAt: new Date('2025-01-01'),
        expiresAt: new Date('2025-06-01'),
        id: 'a-3',
        instrumentId: 'i-1',
        status: 'COMPLETE',
        subjectId: 'subject-3'
      }
    ];
    mocks.instrumentInfo = [{ details: { title: 'Test Instrument' }, id: 'i-1' }];
    renderComponent();
    expect(screen.getAllByText('Test Instrument')).toHaveLength(2);
  });

  it('should disable the delete button when nothing is selected', () => {
    mocks.assignments = [
      {
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        id: 'a-1',
        instrumentId: 'i-1',
        status: 'OUTSTANDING',
        subjectId: 'subject-1'
      }
    ];
    renderComponent();
    const button = screen.getByTestId('delete-selected-assignments');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('should open a confirmation dialog when the delete button is clicked', () => {
    mocks.assignments = [
      {
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        id: 'a-1',
        instrumentId: 'i-1',
        status: 'OUTSTANDING',
        subjectId: 'subject-1'
      }
    ];
    renderComponent();
    const checkbox = screen.getByTestId('delete-select-assignment-a-1');
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByTestId('delete-selected-assignments'));
    expect(screen.getByTestId('confirm-delete-assignments')).toBeTruthy();
  });

  it('should call the delete mutation with selected ids on confirmation', () => {
    mocks.assignments = [
      {
        createdAt: new Date('2026-01-01'),
        expiresAt: new Date('2027-01-01'),
        id: 'a-1',
        instrumentId: 'i-1',
        status: 'OUTSTANDING',
        subjectId: 'subject-1'
      }
    ];
    renderComponent();
    fireEvent.click(screen.getByTestId('delete-select-assignment-a-1'));
    fireEvent.click(screen.getByTestId('delete-selected-assignments'));
    fireEvent.click(screen.getByTestId('confirm-delete-assignments'));
    expect(mocks.deleteMutate).toHaveBeenCalledTimes(1);
    expect(mocks.deleteMutate.mock.lastCall?.[0]).toMatchObject({ ids: ['a-1'] });
  });
});
