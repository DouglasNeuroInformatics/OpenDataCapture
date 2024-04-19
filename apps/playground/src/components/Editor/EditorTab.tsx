import React, { useRef } from 'react';

import { cn } from '@douglasneuroinformatics/libui/utils';
import { XIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { useEditorStore } from '@/store/editor.store';

import type { EditorFile } from '../../models/editor-file.model';

export type EditorTabProps = {
  file: EditorFile;
};

export const EditorTab = ({ file }: EditorTabProps) => {
  const xRef = useRef<HTMLDivElement>(null);
  const { closeFile, selectFile, selectedFile } = useEditorStore(
    useShallow(({ closeFile, selectFile, selectedFile }) => ({ closeFile, selectFile, selectedFile }))
  );
  return (
    <button
      className={cn(
        'flex w-full max-w-[18rem] items-center justify-between gap-12 border-l border-slate-900/10 px-4 py-1.5 text-sm last:border-r dark:border-slate-100/25',
        file.name === selectedFile?.name && 'bg-slate-100 shadow-sm dark:bg-slate-700'
      )}
      type="button"
      onClick={(event) => {
        const isClose = xRef.current?.contains(event.target as HTMLElement);
        if (isClose) {
          closeFile(file);
        } else {
          selectFile(file);
        }
      }}
    >
      <span className="leading-non truncate">{file.name}</span>
      <div className="rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600" ref={xRef}>
        <XIcon style={{ height: '14px', width: '14px' }} />
      </div>
    </button>
  );
};
