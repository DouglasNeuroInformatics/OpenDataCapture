import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  async hashPassword(password: string): Promise<string> {
    return this.pbkdf2(password, this.genSalt());
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const salt = hashedPassword.split('$')[1];
    return (await this.pbkdf2(password, salt)) === hashedPassword;
  }

  private async pbkdf2(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha512', (err, key) => {
        if (err) {
          reject(err);
        }
        resolve([key, salt].join('$'));
      });
    });
  }

  private genSalt(size = 16): string {
    return crypto.randomBytes(size).toString('hex');
  }
}
