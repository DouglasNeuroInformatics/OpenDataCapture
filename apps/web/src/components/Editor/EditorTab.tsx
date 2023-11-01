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
        'flex w-full max-w-[18rem] items-center justify-between gap-12 border-l border-slate-900/10 px-4 py-1.5 last:border-r dark:border-slate-100/25',
        isActive && 'bg-slate-100 shadow-sm dark:bg-slate-700'
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
      <span className="leading-non truncate">{model.uri.path.slice(1)}</span>
      <div className="rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600" ref={xRef}>
        <XMarkIcon height={14} width={14} />
      </div>
    </button>
  );
};
