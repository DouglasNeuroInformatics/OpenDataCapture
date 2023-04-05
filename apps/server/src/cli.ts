import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function cli(): Promise<void> {
  await CommandFactory.run(AppModule, {
    serviceErrorHandler: (error) => {
      console.error('\x1b[31m' + `ERROR: ${JSON.stringify(error, null, 2)}` + '\x1b[0m');
    },
    logger: ['error', 'warn']
  });
}

void cli();
