import { motion } from 'framer-motion';

export type EditorSidebarProps = {
  isOpen: boolean;
};

export const EditorSidebar = ({ isOpen }: EditorSidebarProps) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
      className="flex-shrink-0 overflow-hidden shadow-sm"
      initial={{ width: 0 }}
    >
      <div className="h-full w-full border-r border-slate-900/10 dark:border-slate-100/25">
        <h1>Sidebar</h1>
      </div>
    </motion.div>
  );
};
