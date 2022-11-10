import express from 'express';

import bodyParser from 'body-parser';

import config from './config';
import patientRoutes from './routes/patient-routes';
import connectToDatabase from './services/connectToDatabase';

async function main(): Promise<void> {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/patient', patientRoutes);
  await connectToDatabase(config.mongoUri);

  app.listen(config.port, () => {
    console.log(`Application listening on port ${config.port}`);
  });
}

void main();
