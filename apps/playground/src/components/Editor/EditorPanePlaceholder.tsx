import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';

export type EditorPanePlaceholderProps = {
  children: string;
};

export const EditorPanePlaceholder = ({ children }: EditorPanePlaceholderProps) => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center text-center">
      <Heading className="font-medium" variant="h5">
        {children}
      </Heading>
    </div>
  );
};
