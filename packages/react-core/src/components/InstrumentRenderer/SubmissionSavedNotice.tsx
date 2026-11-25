import type { ReactNode } from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { motion } from 'motion/react';

/** The three strokes of a floppy disk, drawn in the order a hand would draw them. */
const DISK_STROKES = [
  'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  'M7 3v4a1 1 0 0 0 1 1h7',
  'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7'
];

export type SubmissionSavedNoticeProps = {
  /** Rendered below the heading: the supporting line, and any action that follows the save. */
  children?: ReactNode;
};

export const SubmissionSavedNotice = ({ children }: SubmissionSavedNoticeProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2 text-center"
      data-testid="submission-saved-notice"
      initial={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        className="size-10 text-green-700 dark:text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        {DISK_STROKES.map((stroke, index) => (
          <motion.path
            animate={{ pathLength: 1 }}
            d={stroke}
            initial={{ pathLength: 0 }}
            key={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            transition={{ delay: index * 0.35, duration: 0.45 }}
          />
        ))}
      </svg>
      <Heading className="text-green-800 dark:text-green-500" variant="h4">
        {t({
          en: 'Your Results Have Been Saved',
          es: 'Sus resultados se han guardado',
          fr: 'Vos résultats ont été enregistrés'
        })}
      </Heading>
      {children}
    </motion.div>
  );
};
