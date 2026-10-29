import { $EmailDeliveryResult, MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import type { EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import axios from 'axios';

/**
 * Post a request that sends assignment email, single or bulk.
 *
 * Both routes carry the same two concessions, which is why they are stated once: the timeout must
 * outlast the server's whole SMTP failure budget, because aborting sooner can happen after the mail
 * has already gone out and a resend then leaves the participant holding a second copy of every
 * link; and the default error notification is suppressed, because every caller renders the failure
 * where the operator is looking rather than as a toast over the page.
 */
export const postAssignmentEmail = async (path: string, body: unknown): Promise<EmailDeliveryResult> => {
  const response = await axios.post(path, body, {
    meta: { disableDefaultErrorNotification: true, disableDefaultTimeout: true },
    timeout: MAIL_CLIENT_TIMEOUT
  });
  return $EmailDeliveryResult.parseAsync(response.data);
};
