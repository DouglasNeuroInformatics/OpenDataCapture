import { useRef } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

import type { EditorFile } from './types';

export type EditorTabProps = {
  file: EditorFile;
  isActive: boolean;
  onClose: (file: EditorFile) => void;
  onSelection: (file: EditorFile) => void;
};

export const EditorTab = ({ file, isActive, onClose, onSelection }: EditorTabProps) => {
  const xRef = useRef<HTMLDivElement>(null);
  return (
    <button
      className={twMerge(
        'flex w-full max-w-[18rem] items-center justify-between gap-12 border-l border-slate-900/10 px-4 py-1.5 last:border-r dark:border-slate-100/25',
        isActive && 'bg-slate-100 shadow-sm dark:bg-slate-700'
      )}
      type="button"
      onClick={(event) => {
        const isClose = xRef.current?.contains(event.target as HTMLElement);
        if (isClose) {
          onClose(file);
        } else {
          onSelection(file);
        }
      }}
    >
      <span className="leading-non truncate">{file.path}</span>
      <div className="rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600" ref={xRef}>
        <XMarkIcon height={14} width={14} />
      </div>
    </button>
  );
};
