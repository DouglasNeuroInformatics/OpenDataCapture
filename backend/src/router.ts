import { Router } from 'express';

const router = Router();

router.get('/patients', (req, res) => {
  console.log('GET request');
  res.json([
    {
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date(),
      sex: 'Male'
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date(),
      sex: 'Female'
    }
  ]);
});

router.post('/patients', (req, res) => {
  console.log('POST request');
  const data = req.body;
  console.log(data);
});

export default router;