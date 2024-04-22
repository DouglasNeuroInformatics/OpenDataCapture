import React from 'react';

import { Tooltip } from '@douglasneuroinformatics/libui/components';

export type ActionButtonProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip: string;
};

export const ActionButton = ({ icon, onClick, tooltip }: ActionButtonProps) => (
  <div className="relative">
    <Tooltip delayDuration={700}>
      <Tooltip.Trigger className="h-9 w-9" size="icon" type="button" variant="outline" onClick={onClick}>
        {icon}
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">
        <p>{tooltip}</p>
      </Tooltip.Content>
    </Tooltip>
  </div>
);
