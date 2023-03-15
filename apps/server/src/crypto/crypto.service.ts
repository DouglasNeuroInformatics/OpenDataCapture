import { Injectable } from '@nestjs/common';

import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, await bcrypt.genSalt());
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
