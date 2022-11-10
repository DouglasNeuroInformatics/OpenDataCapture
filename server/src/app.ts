import express from 'express';

import bodyParser from 'body-parser';

import patientRoutes from './routes/patient-routes';

const app = express();
app.use(bodyParser.json());
app.use('/api/patient', patientRoutes);

export default app;
