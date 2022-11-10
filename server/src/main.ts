import app from './app';
import config from './config';
import connectToDatabase from './services/connectToDatabase';

async function main(): Promise<void> {
  await connectToDatabase(config.mongoUri);
  app.listen(config.port, () => {
    console.log(`Application listening on port ${config.port}`);
  });
}

void main();
