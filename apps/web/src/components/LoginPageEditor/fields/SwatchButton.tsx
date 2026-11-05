import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

type SwatchButtonProps = {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  style: React.CSSProperties;
};

/** A selectable color swatch, used by the login page's theme grids and the card color settings. */
export const SwatchButton = ({ isSelected, label, onClick, style }: SwatchButtonProps) => (
  <button
    aria-pressed={isSelected}
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
