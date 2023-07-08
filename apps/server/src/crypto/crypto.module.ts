import { Module } from '@nestjs/common';

import { CryptoService } from './crypto.service.js';

@Module({
  providers: [CryptoService],
  exports: [CryptoService]
})
export class CryptoModule {}
