import express from 'express';

import bodyParser from 'body-parser';

import instrumentRoutes from './routes/instrument-routes';
import patientRoutes from './routes/patient-routes';

const app = express();
app.use(bodyParser.json());
app.use('/api/instrument', instrumentRoutes);
app.use('/api/patient', patientRoutes);

export default app;
