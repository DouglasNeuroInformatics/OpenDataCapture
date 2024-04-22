import React, { useState } from 'react';

import { Columns3Icon, FilePlusIcon } from 'lucide-react';

import { useEditorStore } from '@/store/editor.store';

import { EditorButton } from './EditorButton';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorPane } from './EditorPane';
import { EditorSidebar } from './EditorSidebar';
import { EditorTab } from './EditorTab';

import './setup';

export const Editor = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openFiles = useEditorStore((store) => store.openFiles);
  return (
    <div className="flex h-full w-full flex-col border border-r-0 bg-slate-50 dark:bg-slate-800">
      <div className="flex w-full border-b">
        <EditorButton icon={<Columns3Icon />} tip="View Files" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <EditorButton
          icon={<FilePlusIcon />}
          tip="Add File"
          onClick={() => {
            setIsSidebarOpen(true);
          }}
        />
        {openFiles.map((file) => (
          <EditorTab file={file} key={file.name} />
        ))}
      </div>
      <div className="flex h-full">
        <EditorSidebar isOpen={isSidebarOpen} />
        {openFiles.length ? <EditorPane /> : <EditorEmptyState />}
      </div>
    </div>
  );
};
