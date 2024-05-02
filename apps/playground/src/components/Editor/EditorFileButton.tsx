import React, { useEffect, useRef, useState } from 'react';

import { ContextMenu } from '@douglasneuroinformatics/libui/components';
import { useOnClickOutside } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { PencilIcon, TrashIcon } from 'lucide-react';

import { useAppStore } from '@/store';

import { EditorFileIcon } from './EditorFileIcon';
import { EditorInput } from './EditorInput';

export type EditorFileButtonProps = {
  filename: string;
  isActive: boolean;
  onDelete: () => void;
};

export const EditorFileButton = ({ filename, isActive, onDelete }: EditorFileButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const indexFilename = useAppStore((store) => store.indexFilename);
  const selectFile = useAppStore((store) => store.selectFile);
  const [displayFilename, setDisplayFilename] = useState(filename);
  const [isRenaming, setIsRenaming] = useState(false);
  const renameFile = useAppStore((store) => store.renameFile);

  const rename = () => {
    renameFile(filename, displayFilename);
    setIsRenaming(false);
  };

  useOnClickOutside(inputRef, () => {
    if (filename !== displayFilename) {
      rename();
    }
  });

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
    }
  }, [isRenaming]);

  useEffect(() => {
    setDisplayFilename(filename);
  }, [filename]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-2 p-2 text-sm',
            isActive && 'bg-slate-100 dark:bg-slate-700',
            filename === indexFilename && 'font-medium'
          )}
          type="button"
          onClick={() => selectFile(filename)}
        >
          <EditorFileIcon filename={displayFilename} />
          <EditorInput
            readOnly={!isRenaming}
            ref={inputRef}
            value={displayFilename}
            onChange={(event) => setDisplayFilename(event.target.value)}
            onKeyUp={(event) => {
              if (event.code === 'Enter') {
                rename();
              }
            }}
          />
        </button>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="w-64">
        <ContextMenu.Item
          onSelect={() => {
            onDelete();
          }}
        >
          <TrashIcon />
          <span className="ml-2 text-sm">Delete</span>
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={() => {
            setIsRenaming(true);
          }}
        >
          <PencilIcon />
          <span className="ml-2 text-sm">Rename</span>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};
