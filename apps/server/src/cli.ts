import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function cli(): Promise<void> {
  await CommandFactory.run(AppModule, {
    serviceErrorHandler: (error) => {
      console.error(error);
    },
    logger: ['error', 'warn']
  });
}

void cli();
