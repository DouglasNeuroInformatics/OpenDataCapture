import { VirtualizationModule } from '@douglasneuroinformatics/libnest';
import { Module } from '@nestjs/common';

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

import type { InstrumentVirtualizationContext } from './instruments.service';

@Module({
  controllers: [InstrumentsController],
  exports: [InstrumentsService],
  imports: [
    VirtualizationModule.forRoot({
      context: {
        __resolveImport: (specifier) => {
          if (!specifier.startsWith('/runtime/')) {
            throw new Error(`Unexpected non-runtime import: ${specifier}`);
          }
          return import.meta.resolve(specifier.replace(/^\/runtime/, '#runtime'));
        },
        instruments: new Map()
      } satisfies InstrumentVirtualizationContext,
      contextOptions: {
        codeGeneration: {
          strings: false,
          wasm: false
        }
      }
    })
  ],
  providers: [InstrumentsService]
})
export class InstrumentsModule {}
