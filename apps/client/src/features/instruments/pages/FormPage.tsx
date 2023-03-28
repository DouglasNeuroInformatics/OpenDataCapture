import React from 'react';

import { useParams } from 'react-router-dom';

import { useFetch } from '@/hooks/useFetch';

export const FormPage = () => {
  const params = useParams();

  const { data } = useFetch(`/instruments/forms/${params.id!}`);

  console.log(data);

  return <h1>Work in Progress!</h1>;
};
