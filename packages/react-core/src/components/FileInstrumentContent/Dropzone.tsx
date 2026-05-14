import { memo, useCallback, useMemo } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { UploadIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { ErrorBox } from './ErrorBox';
import { useFileInstrumentContentStore } from './store';

export const Dropzone = memo<{ index: number }>(function Dropzone({ index }) {
  const { basename, count } = useFileInstrumentContentStore((store) => {
    return store.props.instrument.content.fileGroups[index]!;
  });
  const files = useFileInstrumentContentStore((store) => store.uploadMap[basename]!);
  const issues = useFileInstrumentContentStore((store) => store.errors[basename]);
  const setFiles = useFileInstrumentContentStore((store) => store.actions.setFiles);
  const { t } = useTranslation();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(basename, acceptedFiles);
    },
    [basename]
  );

  const { getInputProps, getRootProps } = useDropzone({
    maxFiles: count,
    onDrop: handleDrop
  });

  const displayText = useMemo(() => {
    const filenames = files.map((file) => file.name);
    const count = filenames.length;

    if (count === 0) {
      return t({
        en: 'Drag and Drop or Click to Upload',
        fr: 'Glissez-déposez ou cliquez pour télécharger'
      });
    } else if (count <= 2) {
      return filenames.join(', ');
    }

    const displayed = filenames.slice(0, 2).join(', ');
    const remaining = count - 2;

    return t({
      en: `${displayed}, and ${remaining} more files...`,
      fr: `${displayed} et ${remaining} autres fichiers...`
    });
  }, [files, t]);

  return (
    <div className="flex flex-col gap-3">
      <h3>
        {t({ en: 'File' })} {index + 1}
      </h3>
      <div
        className="flex h-60 flex-col items-center justify-center rounded-md border border-dashed border-slate-400 p-4 dark:border-slate-600"
        data-testid="dropzone"
        {...getRootProps()}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <UploadIcon style={{ height: 20, strokeWidth: 2, width: 20 }} />
            <h4 className="text-semi-sm font-medium tracking-tight">{displayText}</h4>
          </div>
        </div>
        <input {...getInputProps()} />
      </div>
      {issues && <ErrorBox issues={issues.map((issue) => t(issue))} title={t({ en: 'Invalid Input' })} />}
    </div>
  );
});
