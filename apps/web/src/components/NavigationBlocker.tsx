import React from 'react';

import { NavigationBlockerDialog } from '@opendatacapture/react-core';
import type { NavigationBlockerProps } from '@opendatacapture/react-core';
import { useBlocker } from '@tanstack/react-router';

export const NavigationBlocker: React.FC<NavigationBlockerProps> = ({ active, message }) => {
  const blocker = useBlocker({
    enableBeforeUnload: true,
    shouldBlockFn: () => active,
    withResolver: true
  });
  return (
    <NavigationBlockerDialog
      message={message}
      open={blocker.status === 'blocked'}
      onCancel={blocker.reset}
      onConfirm={blocker.proceed}
    />
  );
};
