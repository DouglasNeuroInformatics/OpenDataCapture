import express from 'express';
import { MongoClient } from 'mongodb';

import router from './router';

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

/*

const database = client.db('development');
const patients = database.collection('patients');

patients.insertOne({
  firstName: 'John'
});
*/

const app = express();
const port = 3000;

app.use('/api', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});