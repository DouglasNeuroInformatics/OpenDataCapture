import { AnimatePresence, motion } from 'framer-motion'

import { LoadingFallback } from './LoadingFallback';

export const SuspenseFallback = () => (
  <AnimatePresence>
    { <motion.div 
  animate = {{opacity: 1}}
  className="flex h-screen w-screen items-center justify-center"
  exit = {{opacity: 0}}
  initial = {{opacity: 0}}
  transition={{ease: "ease-out", duration: 1}}>
    <LoadingFallback/>
  </motion.div>}
  </AnimatePresence>
);
