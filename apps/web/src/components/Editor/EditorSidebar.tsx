import { DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { EditorFile } from './types';

export type EditorSidebarProps = {
  files: EditorFile[];
  isOpen: boolean;
};

export const EditorSidebar = ({ files, isOpen }: EditorSidebarProps) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
      className="flex-shrink-0 overflow-hidden shadow-sm"
      initial={{ width: 0 }}
    >
      <div className="h-full w-full border-r border-slate-900/10 p-2 dark:border-slate-100/25">
        {files.map((file) => (
          <div className="flex items-center gap-2 text-sm" key={file.filename}>
            <DocumentIcon height={14} width={14} />
            <span>{file.filename}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
