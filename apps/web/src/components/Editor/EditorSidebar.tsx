import { motion } from 'framer-motion';

export type EditorSidebarProps = {
  isOpen: boolean;
};

export const EditorSidebar = ({ isOpen }: EditorSidebarProps) => {
  return (
    <motion.div
      animate={{ width: isOpen ? 320 : 0 }}
      className="flex-shrink-0 overflow-hidden bg-slate-100"
      initial={{ width: 0 }}
    >
      <h1>Sidebar</h1>
    </motion.div>
  );
};
