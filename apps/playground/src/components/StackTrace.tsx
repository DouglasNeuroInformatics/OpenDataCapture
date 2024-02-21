import { useState } from 'react';

import { cn } from '@douglasneuroinformatics/ui';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { parse } from 'stacktrace-parser';

export const StackTrace: React.FC<{ stack: string }> = ({ stack }) => {
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
        Stack Trace
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
        <div>
          {parse(stack).map((frame, i) => (
            <div className="text-sm text-slate-700 dark:text-slate-300" key={i}>
              <p className="ml-1">
                {`at ${frame.methodName} (`}
                <a className="hover:underline" href={frame.file ?? '#'} rel="noreferrer" target="_blank">
                  {frame.file}
                </a>
                {`:${frame.lineNumber}:${frame.column})`}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};
