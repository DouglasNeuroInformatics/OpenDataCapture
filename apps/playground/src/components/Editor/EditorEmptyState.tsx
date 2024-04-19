import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';

export const EditorEmptyState = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center text-center">
      <Heading className="font-medium" variant="h5">
        No File Selected
      </Heading>
    </div>
  );
};
