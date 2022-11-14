import app from './app';
import config from './config';
import connectToDatabase from './services/connectToDatabase';
import { createDummyPatients, purgeDatabase } from './utils/dummy';

async function main(): Promise<void> {
  await connectToDatabase(config.mongoUri);
  if (config.env === 'demo') {
    await purgeDatabase();
    await createDummyPatients();
  }
  app.listen(config.port, () => {
    console.log(`Application listening on port ${config.port}`);
  });
}

void main();
