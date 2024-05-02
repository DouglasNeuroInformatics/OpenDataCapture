import React, { useRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { XIcon } from 'lucide-react';

import { useAppStore } from '@/store';

export type EditorTabProps = {
  filename: string;
};

export const EditorTab = ({ filename }: EditorTabProps) => {
  const xRef = useRef<HTMLDivElement>(null);
  const closeFile = useAppStore((store) => store.closeFile);
  const selectFile = useAppStore((store) => store.selectFile);
  const selectedFilename = useAppStore((store) => store.selectedFilename);

  return (
    <button
      className={cn(
        'flex w-full max-w-[14rem] items-center justify-between gap-12 border-l border-slate-900/10 px-4 py-1.5 text-sm last:border-r dark:border-slate-100/25',
        filename === selectedFilename && 'bg-slate-100 shadow-sm dark:bg-slate-700'
      )}
      type="button"
      onClick={(event) => {
        const isClose = xRef.current?.contains(event.target as HTMLElement);
        if (isClose) {
          closeFile(filename);
        } else {
          selectFile(filename);
        }
      }}
    >
      <span className="leading-non truncate">{filename}</span>
      <div className="rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600" ref={xRef}>
        <XIcon style={{ height: '14px', width: '14px' }} />
      </div>
    </button>
  );
};
