import { useState } from 'react';

import { cn } from '@douglasneuroinformatics/ui';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export const ToggledContent: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="flex w-min items-center justify-center gap-1 whitespace-nowrap rounded-md py-0.5 font-bold"
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {label}
        <ChevronUpIcon
          className={cn('transform-gpu transition-transform duration-150', isOpen && 'rotate-180')}
          height={16}
          width={16}
        />
      </button>
      <motion.div
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="h-0 overflow-hidden"
        transition={{ duration: 0.15 }}
      >
        <div>{children}</div>
      </motion.div>
    </>
  );
};
