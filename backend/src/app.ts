import express from 'express';

import { errorRequestHandler } from './controllers/error-controllers';
import patientRoutes from './routes/patient-routes';

const app = express();
const port = 3000;

app.use('/api/patient', patientRoutes);
app.use(errorRequestHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


/*
async function main() {
  const client = new MongoClient('mongodb://mongo:27017');
  try {
    await client.connect();
    console.log('Success!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  
}

main();



const database = client.db('development');
const patients = database.collection('patients');

patients.insertOne({
  firstName: 'John'
});


app.use(bodyParser.json());



*/