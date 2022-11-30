import express from 'express';

import instrumentRoutes from './routes/instrument-routes';
import patientRoutes from './routes/patient-routes';

const app = express();
app.use(express.json());
app.use('/api/instrument', instrumentRoutes);
app.use('/api/patient', patientRoutes);

export default app;
