import React from 'react';

import { Tooltip } from '@douglasneuroinformatics/libui/components';

export type EditorButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  tip: string;
};

export const EditorButton = ({ icon, onClick, tip }: EditorButtonProps) => (
  <Tooltip delayDuration={700}>
    <Tooltip.Trigger
      className="text-muted-foreground h-8 w-8 rounded-none"
      size="icon"
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      {icon}
    </Tooltip.Trigger>
    <Tooltip.Content side="right">
      <p>{tip}</p>
    </Tooltip.Content>
  </Tooltip>
);
