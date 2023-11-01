import { useRef } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

import type { EditorModel } from './types';

export type EditorTabProps = {
  isActive: boolean;
  model: EditorModel;
  onClose: (id: string) => void;
  onSelection: (id: string) => void;
};

export const EditorTab = ({ isActive, model, onClose, onSelection }: EditorTabProps) => {
  const xRef = useRef<HTMLDivElement>(null);
  return (
    <button
      className={twMerge(
        'flex w-fit items-center justify-between gap-10 px-6 py-2',
        isActive && 'bg-slate-100 dark:bg-slate-700'
      )}
      type="button"
      onClick={(event) => {
        const isClose = xRef.current?.contains(event.target as HTMLElement);
        if (isClose) {
          onClose(model.id);
        } else {
          onSelection(model.id);
        }
      }}
    >
      {model.uri.path.slice(1)}
      <div className="justify-self-end rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600" ref={xRef}>
        <XMarkIcon className="h-4 w-4" />
      </div>
    </button>
  );
};
