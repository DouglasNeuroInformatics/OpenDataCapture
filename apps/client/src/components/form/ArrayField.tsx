import React from 'react';

import { ArrayFormField } from '@ddcp/common';

type ArrayFieldProps = ArrayFormField;

export const ArrayField = ({ fieldset }: ArrayFieldProps) => {
  return (
    <div>
      <span>{JSON.stringify(fieldset, null, 2)}</span>
    </div>
  );
};
