import React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { RefreshCwIcon } from 'lucide-react';

import { useViewerStore } from '@/store/viewer.store';

export const RefreshButton = () => {
  const onClick = useViewerStore((store) => store.forceRefresh);
  return (
    <Button className="h-9 w-9" size="icon" type="button" variant="outline" onClick={onClick}>
      <RefreshCwIcon />
    </Button>
  );
};
