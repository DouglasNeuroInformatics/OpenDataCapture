import React, { useEffect, useRef, useState } from 'react';

import { ContextMenu } from '@douglasneuroinformatics/libui/components';
import { useOnClickOutside } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { PencilIcon, TrashIcon } from 'lucide-react';

import type { EditorFile } from '@/models/editor-file.model';
import { useEditorStore } from '@/store/editor.store';

import { EditorFileIcon } from './EditorFileIcon';
import { EditorInput } from './EditorInput';

export type EditorFileButtonProps = {
  file: EditorFile;
  isActive: boolean;
  onDelete: () => void;
};

export const EditorFileButton = ({ file, isActive, onDelete }: EditorFileButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const indexFile = useEditorStore((store) => store.indexFile);
  const selectFile = useEditorStore((store) => store.selectFile);
  const [filename, setFilename] = useState(file.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const renameFile = useEditorStore((store) => store.renameFile);

  const rename = () => {
    renameFile(file.id, filename);
    setIsRenaming(false);
  };

  useOnClickOutside(inputRef, () => rename());

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
    }
  }, [isRenaming]);

  useEffect(() => {
    setFilename(file.name);
  }, [file]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-2 p-2 text-sm',
            isActive && 'bg-slate-100 dark:bg-slate-700',
            file === indexFile && 'font-medium'
          )}
          type="button"
          onClick={() => selectFile(file)}
        >
          <EditorFileIcon filename={filename} />
          <EditorInput
            readOnly={!isRenaming}
            ref={inputRef}
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
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
          disabled={file === indexFile}
          onSelect={() => {
            onDelete();
          }}
        >
          <TrashIcon />
          <span className="ml-2 text-sm">Delete</span>
        </ContextMenu.Item>
        <ContextMenu.Item
          disabled={file === indexFile}
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
