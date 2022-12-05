import app from './app';
import config from './config';
import connectToDatabase from './services/connectToDatabase';
import { createDummySubjects, purgeDatabase } from './utils/dummy';

async function main(): Promise<void> {
  await connectToDatabase(config.mongoUri);
  if (config.env === 'development') {
    await purgeDatabase();
    await createDummySubjects();
  }
  app.listen(config.port, () => {
    console.log(`Application listening on port ${config.port}`);
  });
}

void main();
