import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function cli(): Promise<void> {
  await CommandFactory.run(AppModule);
}

void cli();
