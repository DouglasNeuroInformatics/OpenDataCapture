import express from 'express';

import cors from 'cors';

import instrumentRoutes from './routes/instrument-routes';
import subjectRoutes from './routes/subject-routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/instrument', instrumentRoutes);
app.use('/api/subject', subjectRoutes);

export default app;
