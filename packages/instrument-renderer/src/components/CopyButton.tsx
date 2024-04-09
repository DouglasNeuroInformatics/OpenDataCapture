import React, { useState } from 'react';

import { ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { match } from 'ts-pattern';

export const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [state, setState] = useState<'READY' | 'SUCCESS'>('READY');

  return (
    <button
      className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700"
      type="button"
      onClick={() => {
        if (state === 'READY') {
          navigator.clipboard
            .writeText(text)
            .then(() => setState('SUCCESS'))
            .catch(console.error);
        }
      }}
      onMouseLeave={() => {
        setState('READY');
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={state}
          transition={{ duration: 0.5 }}
        >
          {match(state)
            .with('READY', () => <ClipboardDocumentListIcon height={20} width={20} />)
            .with('SUCCESS', () => <ClipboardDocumentCheckIcon height={20} width={20} />)
            .exhaustive()}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
