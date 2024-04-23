import React from 'react';

import { RefreshCwIcon } from 'lucide-react';

import { useViewerStore } from '@/store/viewer.store';

import { ActionButton } from '../ActionButton';

export const RefreshButton = () => {
  const onClick = useViewerStore((store) => store.forceRefresh);
  return <ActionButton icon={<RefreshCwIcon />} tooltip="Refresh" onClick={onClick} />;
};
