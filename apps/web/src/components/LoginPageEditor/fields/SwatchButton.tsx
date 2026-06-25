import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

type SwatchButtonProps = {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  style: React.CSSProperties;
};

/** A selectable gradient swatch used by the left- and right-panel theme grids. */
export const SwatchButton = ({ isSelected, label, onClick, style }: SwatchButtonProps) => (
  <button
    className={cn(
      'flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-all',
      isSelected ? 'border-primary ring-primary/40 ring-2' : 'border-input hover:border-primary/50'
    )}
    type="button"
    onClick={onClick}
  >
    <span className="h-12 w-full rounded-md" style={style} />
    <span className="text-xs font-medium">{label}</span>
  </button>
);
