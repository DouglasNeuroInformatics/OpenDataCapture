import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  hash(source: string): string {
    return crypto.createHash('sha256').update(source).digest('hex');
  }

  async hashPassword(source: string): Promise<string> {
    return bcrypt.hash(source, 10);
  }

  async comparePassword(source: string, hash: string): Promise<boolean> {
    return bcrypt.compare(source, hash);
  }
}
