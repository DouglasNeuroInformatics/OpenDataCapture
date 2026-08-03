import { $TestMailResult, MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import type { TestMailData } from '@opendatacapture/schemas/mail';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useTestMailMutation() {
  return useMutation({
    mutationFn: async (data: TestMailData) => {
      // The timeout must outlast the server's whole SMTP failure budget (which the global 10s
      // default would cut short), and the generic error toast is suppressed because this
      // mutation surfaces its own success/failure notifications.
      const response = await axios.post('/v1/mail/test', data, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
        timeout: MAIL_CLIENT_TIMEOUT
      });
      return $TestMailResult.parseAsync(response.data);
    },
    // The caller has an onError handler; without this the rejection still reaches the boundary.
    throwOnError: false
  });
}
