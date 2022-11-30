import React from 'react';

import { useRouter } from 'next/router';

const PatientPage = () => {
  const router = useRouter();

  return <h1>Patient {router.query.id}</h1>;
};

export default PatientPage;
