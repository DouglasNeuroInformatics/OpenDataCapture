import { Module } from '@nestjs/common';

import { DocsService } from './docs.service';

@Module({
  providers: [DocsService],
  exports: [DocsService]
})
export class DocsModule {}
