import crypto from 'crypto';

import { CONFIG } from '@/config';

export async function generateToken(assignmentId: string) {
  return crypto
    .createHash('sha256')
    .update(CONFIG.apiKey + assignmentId, 'utf8')
    .digest()
    .toString('hex');
}
