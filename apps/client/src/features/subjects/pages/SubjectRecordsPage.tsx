import React from 'react';

import { useParams } from 'react-router-dom';

export const SubjectRecordsPage = () => {
  const params = useParams();

  return <h1>Subject Records {JSON.stringify(params)}</h1>;
};
