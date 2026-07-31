import type { Language } from '@opendatacapture/schemas/core';
import { $EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useSendAssignmentEmailMutation() {
  return useMutation({
    mutationFn: async ({
      assignmentId,
      language,
      recipient,
      templateId
    }: {
      assignmentId: string;
      language: Language;
      recipient: string;
      templateId?: null | string;
    }) => {
      // A slow SMTP host can take ~20s to fail server-side. Without opting out of the global 10s
      // timeout the request aborts after the mail has already gone out, and a resend leaves the
      // participant holding two assignment links.
      const response = await axios.post(
        `/v1/assignments/${encodeURIComponent(assignmentId)}/email`,
        { language, recipient, templateId },
        { meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }, timeout: 30_000 }
      );
      return $EmailDeliveryResult.parseAsync(response.data);
    },
    // The caller renders its own failure message inline; escalating would replace the whole page.
    throwOnError: false
  });
}
