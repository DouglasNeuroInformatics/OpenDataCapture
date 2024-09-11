import crypto from 'crypto';

import { config } from '@/config';

export function generateToken(assignmentId: string) {
  return crypto
    .createHash('sha256')
    .update(config.apiKey + assignmentId, 'utf8')
    .digest()
    .toString('hex');
}
