import { cn } from '@douglasneuroinformatics/libui/utils';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { EditorFile } from '../types';

export type EditorSidebarProps = {
  files: EditorFile[];
  isOpen: boolean;
  onSelection: (file: EditorFile) => void;
  selectedFile: EditorFile | null;
};

export const EditorSidebar = ({ files, isOpen, onSelection, selectedFile }: EditorSidebarProps) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
      className="flex-shrink-0 overflow-hidden shadow-sm"
      initial={{ width: 0 }}
    >
      <div className="h-full w-full border-r border-slate-900/10 dark:border-slate-100/25">
        {files.map((file) => (
          <button
            className={cn(
              'flex w-full items-center gap-2 p-2 text-sm',
              selectedFile?.path === file.path && 'bg-slate-100 dark:bg-slate-700'
            )}
            key={file.path}
            type="button"
            onClick={() => onSelection(file)}
          >
            <DocumentIcon height={14} width={14} />
            <span className="truncate">{file.path}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
