import { DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { EditorModel } from './types';

export type EditorSidebarProps = {
  isOpen: boolean;
  models: EditorModel[];
  onSelection: (id: string) => void;
};

export const EditorSidebar = ({ isOpen, models, onSelection }: EditorSidebarProps) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
      className="flex-shrink-0 overflow-hidden shadow-sm"
      initial={{ width: 0 }}
    >
      <div className="h-full w-full border-r border-slate-900/10 p-2 dark:border-slate-100/25">
        {models.map((model) => (
          <button
            className="flex items-center gap-2 text-sm"
            key={model.id}
            type="button"
            onClick={() => onSelection(model.id)}
          >
            <DocumentIcon height={14} width={14} />
            <span>{model.uri.toString()}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
