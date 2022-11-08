import express from 'express';

import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import { errorRequestHandler } from './controllers/error-controllers';
import instrumentRoutes from './routes/instrument-routes';
import patientRoutes from './routes/patient-routes';
import { HttpError } from './utils/exceptions';

async function main(): Promise<void> {
  const app = express();
  const port = 3000;

  app.use(bodyParser.json());
  app.use('/api/instrument', instrumentRoutes);
  app.use('/api/patient', patientRoutes);

  app.use(() => {
    throw new HttpError(404, 'Could not find route');
  });

  app.use(errorRequestHandler);

  try {
    await mongoose.connect('mongodb://mongo:27017/main');
    console.log('Successfully connected to database');
  } catch (error) {
    console.error('An error occured while connecting to database', error);
    return;
  }

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

main();
