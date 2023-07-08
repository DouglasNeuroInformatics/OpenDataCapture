import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.getOrThrow('SECRET_KEY');
  }

  hash(source: string): string {
    return crypto
      .createHash('sha256')
      .update(source + this.secretKey)
      .digest('hex');
  }

  async hashPassword(source: string): Promise<string> {
    return bcrypt.hash(source, 10);
  }

  async comparePassword(source: string, hash: string): Promise<boolean> {
    return bcrypt.compare(source, hash);
  }
}
