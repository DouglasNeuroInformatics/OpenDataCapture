import { memo, useEffect } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { clamp } from 'lodash-es';
import { motion, useSpring, useTransform } from 'motion/react';

import { useFileInstrumentContentStore } from './store';

export const UploadProgressBar = memo(function UploadProgressBar() {
  const { loadedFiles, totalFiles, totalProgress } = useFileInstrumentContentStore((store) => store.uploadState!);

  const spring = useSpring(0, { damping: 20, restDelta: 0.001, stiffness: 50 });
  const percentage = useTransform(spring, (latest: number) => `${clamp(latest, 0, 100).toFixed(1)}%`);

  const { t } = useTranslation();

  useEffect(() => {
    if (!totalProgress) {
      spring.jump(0);
    } else {
      spring.set(totalProgress);
    }
  }, [totalProgress]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground animate-pulse">
          {t({ en: `Uploading files... (${loadedFiles}/${totalFiles} complete)` })}
        </span>
        <motion.p className="font-medium">{percentage}</motion.p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border bg-slate-200 dark:bg-slate-700">
        <motion.div className="h-full bg-sky-700" style={{ width: percentage }} />
      </div>
    </div>
  );
});
