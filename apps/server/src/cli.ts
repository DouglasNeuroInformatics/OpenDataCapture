import { Logger } from '@nestjs/common';

import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function cli(): Promise<void> {
  await CommandFactory.run(AppModule, {
    serviceErrorHandler: (error) => {
      console.error('\x1b[31m' + `ERROR: ${error.message}` + '\x1b[0m');
    },
    logger: ['error', 'warn']
  });
}

void cli();
