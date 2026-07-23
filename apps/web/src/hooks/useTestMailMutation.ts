import type { TestMailData, TestMailResult } from '@opendatacapture/schemas/mail';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useTestMailMutation() {
  return useMutation({
    mutationFn: async (data: TestMailData) => {
      // A bad host/port can take ~15s to fail server-side, so opt out of the global 10s
      // timeout (which the axios interceptor would otherwise force) and suppress the generic
      // error toast — this mutation surfaces its own success/failure notifications.
      const response = await axios.post<TestMailResult>('/v1/mail/test', data, {
        meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
        timeout: 30_000
      });
      return response.data;
    }
  });
}
