import React from 'react';

import { useParams } from 'react-router-dom';

const SubjectPage = () => {
  const params = useParams();

  return (
    <div className="text-center">
      <h1>Subject Data</h1>
      <p>Subject ID: {params.id}</p>
    </div>
  );
};

export default SubjectPage;
