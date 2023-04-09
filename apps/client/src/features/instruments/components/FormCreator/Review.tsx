import React from 'react';

import { SimpleForm } from './FormCreator';

export interface ReviewProps {
  form: Partial<SimpleForm>;
}

export const Review = ({ form }: ReviewProps) => {
  return <span>{JSON.stringify(form, null, 2)}</span>;
};
