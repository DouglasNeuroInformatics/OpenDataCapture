import { useEffect } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { motion, useSpring, useTransform } from 'motion/react';

type SeriesProgressBarProps = {
  completed: number;
  total: number;
};

export const SeriesProgressBar = ({ completed, total }: SeriesProgressBarProps) => {
  const { t } = useTranslation();
  const fill = (completed / total) * 100;

  // Seeded with the current fill so a resumed series starts where the subject left off.
  const spring = useSpring(fill, { damping: 20, restDelta: 0.001, stiffness: 50 });
  const width = useTransform(spring, (latest: number) => `${latest}%`);

  useEffect(() => {
    spring.set(fill);
  }, [fill]);

  const position = Math.min(completed + 1, total);

  return (
    <div className="mb-6 flex w-full flex-col gap-2" data-testid="series-progress">
      <p className="text-muted-foreground text-sm">
        {t({
          en: `Instrument ${position} of ${total}`,
          es: `Instrumento ${position} de ${total}`,
          fr: `Instrument ${position} sur ${total}`
        })}
      </p>
      <div
        aria-label={t({ en: 'Series progress', es: 'Progreso de la serie', fr: 'Progression de la série' })}
        aria-valuemax={total}
        aria-valuemin={0}
        aria-valuenow={completed}
        className="h-2 w-full overflow-hidden rounded-full border bg-slate-200 dark:bg-slate-700"
        role="progressbar"
      >
        <motion.div className="h-full bg-sky-700" style={{ width }} />
      </div>
    </div>
  );
};
