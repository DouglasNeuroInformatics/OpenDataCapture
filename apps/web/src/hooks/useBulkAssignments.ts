import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import {
  $Assignment,
  $BulkAssignmentFailure,
  $BulkAssignmentPreflightResult
} from '@opendatacapture/schemas/assignment';
import type {
  BulkAssignmentFailure,
  BulkAssignmentPreflightData,
  CreateBulkAssignmentsData
} from '@opendatacapture/schemas/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

/**
 * The key `useAssignmentsQuery` builds on. Extracted so an invalidation cannot drift from the query
 * it is meant to refresh.
 */
export const ASSIGNMENTS_QUERY_KEY = ['assignments'] as const;

/**
 * Recover the structured refusal the API attaches to a rejected bulk request. Any other failure —
 * a network error, a 500 — is not a refusal and carries nothing displayable, so it is left to the
 * caller's generic error handling rather than being dressed up as one.
 */
export function toBulkAssignmentFailure(error: unknown): BulkAssignmentFailure | null {
  if (!isAxiosError(error)) {
    return null;
  }
  const result = $BulkAssignmentFailure.safeParse(error.response?.data);
  return result.success ? result.data : null;
}

/**
 * Validate a batch without creating anything. Rejection is the informative case: the error carries
 * every unavailable subject, unavailable instrument and conflict, which is what the review step
 * shows the user.
 */
export function useBulkAssignmentPreflightMutation() {
  return useMutation({
    // A refusal is a considered answer from the server, not a transient fault — retrying would
    // re-run the same validation and produce the same refusal.
    meta: { disableDefaultErrorNotification: true },
    mutationFn: async (data: BulkAssignmentPreflightData) => {
      const response = await axios.post('/v1/assignments/bulk/preflight', data);
      return $BulkAssignmentPreflightResult.parse(response.data);
    },
    retry: false,
    throwOnError: false
  });
}

/**
 * Create the whole batch, or none of it. A non-2xx response means nothing was created and nothing
 * changed, so there is no partial state for the caller to reconcile.
 */
export function useCreateBulkAssignmentsMutation() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  return useMutation({
    meta: { disableDefaultErrorNotification: true },
    mutationFn: async (data: CreateBulkAssignmentsData) => {
      const response = await axios.post('/v1/assignments/bulk', data);
      return $Assignment.array().parse(response.data);
    },
    onSuccess() {
      addNotification({ type: 'success' });
      void queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
    retry: false,
    throwOnError: false
  });
}
