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

export default router;