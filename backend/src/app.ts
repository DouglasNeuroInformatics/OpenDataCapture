import express from 'express';

import bodyParser from 'body-parser';

import { errorRequestHandler } from './controllers/error-controllers';
import HttpError from './models/HttpError';
import patientRoutes from './routes/patient-routes';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api/patient', patientRoutes);

app.use(() => {
  throw new HttpError(404, 'Could not find route');
});

app.use(errorRequestHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});