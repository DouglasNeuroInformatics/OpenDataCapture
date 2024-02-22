import { useEffect, useState } from 'react';

import { ArrowToggle, Card, cn } from '@douglasneuroinformatics/ui';

import '../setup';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorMenu } from './EditorMenu';
import { EditorPane } from './EditorPane';
import { EditorSidebar } from './EditorSidebar';
import { EditorTab } from './EditorTab';
import { MobileBlocker } from './MobileBlocker';

import type { EditorFile } from '../types';

export type EditorProps = {
  /** Additional classes to be passed to the card component wrapping the editor */
  className?: string;

  /** A list of files to be interpreted as models by the editor */
  files: EditorFile[];

  /** A callback function to be invoked when the user signals to save a file */
  onSave?: (file: EditorFile) => void;
};

export const Editor = ({ className, files, onSave }: EditorProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openFiles, setOpenFiles] = useState<EditorFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<EditorFile | null>(null);

  useEffect(() => {
    setOpenFiles([]);
    setSelectedFile(null);
  }, [files]);

  const handleCloseFile = (closedFile: EditorFile) => {
    setOpenFiles((prevFiles) => {
      const currentIndex = prevFiles.indexOf(closedFile);
      const updatedFiles = prevFiles.filter((file) => file !== closedFile);
      setSelectedFile(updatedFiles.at(currentIndex - 1) ?? null);
      return updatedFiles;
    });
  };

  const handleSelectFile = (file: EditorFile) => {
    const isOpen = openFiles.includes(file);
    if (!isOpen) {
      setOpenFiles((prevFiles) => [...prevFiles, file]);
    }
    setSelectedFile(file);
  };

  return (
    <MobileBlocker>
      <Card className={cn('h-full w-full overflow-hidden', className)}>
        <div className="flex justify-between border-b border-slate-900/10 dark:border-slate-100/25">
          <div className="flex w-full text-sm">
            <ArrowToggle
              className="p-2"
              position="right"
              rotation={180}
              type="button"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            />
            {openFiles.map((file) => (
              <EditorTab
                file={file}
                isActive={file.path === selectedFile?.path}
                key={file.path}
                onClose={handleCloseFile}
                onSelection={handleSelectFile}
              />
            ))}
          </div>
          <EditorMenu onInitSave={() => selectedFile && onSave?.(selectedFile)} />
        </div>
        <div className="flex h-full min-h-[576px]">
          <EditorSidebar
            files={files}
            isOpen={isSidebarOpen}
            selectedFile={selectedFile}
            onSelection={handleSelectFile}
          />
          {selectedFile ? (
            <EditorPane defaultValue={selectedFile.content} path={selectedFile.path} />
          ) : (
            <EditorEmptyState />
          )}
        </div>
      </Card>
    </MobileBlocker>
  );
};
