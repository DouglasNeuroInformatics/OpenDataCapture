import type { EmailDeliveryResult, MailLanguage } from '@opendatacapture/schemas/mail';
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
      language: MailLanguage;
      recipient: string;
      templateId?: null | string;
    }) => {
      const response = await axios.post<EmailDeliveryResult>(
        `/v1/assignments/${encodeURIComponent(assignmentId)}/email`,
        { language, recipient, templateId }
      );
      return response.data;
    }
  });
}
