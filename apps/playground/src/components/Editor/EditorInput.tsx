import React from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';

export const EditorInput = React.forwardRef<
  HTMLInputElement,
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>(function EditorInput({ className, ...props }, ref) {
  return (
    <input
      className={cn(
        'focus:ring-ring focus-visible:ring-ring -my-1 h-full w-full cursor-pointer truncate bg-inherit p-1 ring-1 transition-colors read-only:pointer-events-none read-only:ring-0',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
