import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { RefreshCwIcon } from 'lucide-react';

export const RefreshButton = () => {
  return (
    <Button className="h-9 w-9" size="icon" type="button" variant="outline">
      <RefreshCwIcon />
    </Button>
  );
};
