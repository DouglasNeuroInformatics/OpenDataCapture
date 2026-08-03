import type { Language } from '@opendatacapture/schemas/core';
import { $EmailDeliveryResult, MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
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
      // The timeout must outlast the server's whole SMTP failure budget: aborting sooner can
      // happen after the mail has already gone out, and a resend then leaves the participant
      // holding two assignment links.
      const response = await axios.post(
        `/v1/assignments/${encodeURIComponent(assignmentId)}/email`,
        { language, recipient, templateId },
        { meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true }, timeout: MAIL_CLIENT_TIMEOUT }
      );
      return $EmailDeliveryResult.parseAsync(response.data);
    },
    // The caller renders its own failure message inline; escalating would replace the whole page.
    throwOnError: false
  });
}
