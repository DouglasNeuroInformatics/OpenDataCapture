import type { Language } from '@opendatacapture/schemas/core';
import { useMutation } from '@tanstack/react-query';

import { postAssignmentEmail } from '@/utils/assignment-email';

export function useSendAssignmentEmailMutation() {
  return useMutation({
    mutationFn: ({
      assignmentId,
      language,
      recipient,
      templateId
    }: {
      assignmentId: string;
      language: Language;
      recipient: string;
      templateId?: null | string;
    }) =>
      postAssignmentEmail(`/v1/assignments/${encodeURIComponent(assignmentId)}/email`, {
        language,
        recipient,
        templateId
      }),
    // The caller renders its own failure message inline; escalating would replace the whole page.
    throwOnError: false
  });
}
