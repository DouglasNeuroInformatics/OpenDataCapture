import express from 'express';

import bodyParser from 'body-parser';

import { errorRequestHandler } from './controllers/error-controllers';
import patientRoutes from './routes/patient-routes';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api/patient', patientRoutes);
app.use(errorRequestHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});