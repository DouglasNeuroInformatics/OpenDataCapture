import { Fingerprint } from '../types/fingerprint.type';

import { LoginCredentials } from './login-credentials.interface';

export interface LoginRequest extends LoginCredentials {
  fingerprint?: Fingerprint | null;
}
