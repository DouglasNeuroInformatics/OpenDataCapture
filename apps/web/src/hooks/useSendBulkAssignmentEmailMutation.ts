import type { $SendBulkAssignmentEmailData } from '@opendatacapture/schemas/mail';
import { useMutation } from '@tanstack/react-query';

import { postAssignmentEmail } from '@/utils/assignment-email';

export function useSendBulkAssignmentEmailMutation() {
  return useMutation({
    mutationFn: ({ assignmentIds, language, recipient, templateId }: $SendBulkAssignmentEmailData) => {
      return postAssignmentEmail('/v1/assignments/bulk/email', { assignmentIds, language, recipient, templateId });
    },
    // The caller renders its own failure message inline; escalating would replace the whole page.
    throwOnError: false
  });
}
