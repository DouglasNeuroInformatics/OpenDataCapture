import React from 'react';

import { useRouter } from 'next/router';

const SubjectPage = () => {
  const router = useRouter();
  return <h1>Subject {router.query.id}</h1>;
};

export default SubjectPage;
