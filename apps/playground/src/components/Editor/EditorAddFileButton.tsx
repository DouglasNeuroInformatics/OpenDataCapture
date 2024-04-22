import { useRef, useState } from 'react';

import { useOnClickOutside } from '@douglasneuroinformatics/libui/hooks';
import React from '@opendatacapture/runtime-v1/react.js';

import { EditorFileIcon } from './EditorFileIcon';

export type EditorAddFileButtonProps = {
  onBlur: () => void;
  onSubmit: (filename: string) => void;
};

export const EditorAddFileButton = ({ onSubmit, ...props }: EditorAddFileButtonProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState('');

  useOnClickOutside(ref, () => onSubmit(filename));

  return (
    <button
      className="flex w-full items-center gap-2 bg-slate-100 p-2 text-sm dark:bg-slate-700"
      type="button"
      onClick={() => null}
    >
      <EditorFileIcon filename={filename} />
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className="focus:ring-ring focus-visible:ring-ring -my-1 h-full w-full truncate bg-inherit p-1 transition-colors focus-visible:outline-none focus-visible:ring-1"
        ref={ref}
        value={filename}
        onChange={(event) => setFilename(event.target.value)}
        onKeyUp={(event) => {
          if (event.code === 'Enter') {
            onSubmit(filename);
          }
        }}
        {...props}
      />
    </button>
  );
};
