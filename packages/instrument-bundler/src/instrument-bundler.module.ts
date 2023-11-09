import { Module } from '@nestjs/common';

import { InstrumentBundlerService } from './instrument-bundler.service';

@Module({
  exports: [InstrumentBundlerService],
  providers: [InstrumentBundlerService]
})
export class InstrumentBundlerModule {}
