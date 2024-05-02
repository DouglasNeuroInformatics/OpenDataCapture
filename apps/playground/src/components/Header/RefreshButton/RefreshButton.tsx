import React from 'react';

import { RefreshCwIcon } from 'lucide-react';

import { useAppStore } from '@/store';

import { ActionButton } from '../ActionButton';

export const RefreshButton = () => {
  const onClick = useAppStore((store) => store.viewer.forceRefresh);
  return <ActionButton icon={<RefreshCwIcon />} tooltip="Refresh" onClick={onClick} />;
};
