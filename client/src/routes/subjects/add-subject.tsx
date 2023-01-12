import React from 'react';

import { ActionFunction } from 'react-router-dom';

const addSubjectAction: ActionFunction = ({ request }) => {
  console.log(request);
  return null;
};

const AddSubjectPage = () => {
  return <h1>Subjects</h1>;
};

export { AddSubjectPage as default, addSubjectAction };
