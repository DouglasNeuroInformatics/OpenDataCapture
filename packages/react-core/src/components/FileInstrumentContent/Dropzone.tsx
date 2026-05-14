import { memo, useCallback, useMemo, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FileInstrument } from '@opendatacapture/runtime-core';
import { BracesIcon, FileIcon, FileTextIcon, ImageIcon, SheetIcon, UploadIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';

import { ErrorBox } from './ErrorBox';
import { useFileInstrumentContentStore } from './store';

const FILE_TYPE_DESCRIPTORS: {
  [K in FileInstrument.FileType]: { extensions: string[]; icon: LucideIcon; label: string };
} = {
  'application/json': { extensions: ['.json'], icon: BracesIcon, label: 'JSON' },
  'application/msword': { extensions: ['.doc'], icon: FileTextIcon, label: 'Word' },
  'application/octet-stream': { extensions: [], icon: FileIcon, label: 'Binary' },
  'application/pdf': { extensions: ['.pdf'], icon: FileTextIcon, label: 'PDF' },
  'application/rtf': { extensions: ['.rtf'], icon: FileTextIcon, label: 'RTF' },
  'application/vnd.ms-excel': { extensions: ['.xls'], icon: SheetIcon, label: 'Excel' },
  'application/vnd.oasis.opendocument.spreadsheet': { extensions: ['.ods'], icon: SheetIcon, label: 'ODS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extensions: ['.xlsx'],
    icon: SheetIcon,
    label: 'Excel'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['.docx'],
    icon: FileTextIcon,
    label: 'Word'
  },
  'application/xml': { extensions: ['.xml'], icon: BracesIcon, label: 'XML' },
  'image/bmp': { extensions: ['.bmp'], icon: ImageIcon, label: 'BMP' },
  'image/gif': { extensions: ['.gif'], icon: ImageIcon, label: 'GIF' },
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], icon: ImageIcon, label: 'JPEG' },
  'image/png': { extensions: ['.png'], icon: ImageIcon, label: 'PNG' },
  'image/svg+xml': { extensions: ['.svg'], icon: ImageIcon, label: 'SVG' },
  'image/tiff': { extensions: ['.tif', '.tiff'], icon: ImageIcon, label: 'TIFF' },
  'text/csv': { extensions: ['.csv'], icon: SheetIcon, label: 'CSV' },
  'text/html': { extensions: ['.html', '.htm'], icon: FileTextIcon, label: 'HTML' },
  'text/markdown': { extensions: ['.md', '.markdown'], icon: FileTextIcon, label: 'Markdown' },
  'text/plain': { extensions: ['.txt'], icon: FileTextIcon, label: 'Text' },
  'text/tsv': { extensions: ['.tsv'], icon: SheetIcon, label: 'TSV' }
};

export const Dropzone = memo<{ index: number }>(function Dropzone({ index }) {
  const { basename, count, label, type } = useFileInstrumentContentStore((store) => {
    return store.props.instrument.content.fileGroups[index]!;
  });
  const files = useFileInstrumentContentStore((store) => store.uploadMap[basename]!);
  const issues = useFileInstrumentContentStore((store) => store.errors[basename]);
  const setFiles = useFileInstrumentContentStore((store) => store.actions.setFiles);
  const { t } = useTranslation();

  const [rejectedNames, setRejectedNames] = useState<string[]>([]);

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejectedNames(fileRejections.map((rejection) => rejection.file.name));
      setFiles(basename, acceptedFiles);
    },
    [basename]
  );

  const acceptConfig = useMemo(() => {
    if (type === null || !FILE_TYPE_DESCRIPTORS[type].extensions.length) {
      return undefined;
    }
    return { [type]: FILE_TYPE_DESCRIPTORS[type].extensions };
  }, [type]);

  const { getInputProps, getRootProps } = useDropzone({
    accept: acceptConfig,
    maxFiles: count.max,
    onDrop: handleDrop
  });

  const displayText = useMemo(() => {
    const filenames = files.map((file) => file.name);
    const fileCount = filenames.length;

    if (fileCount === 0) {
      return t({
        en: 'Drag and Drop or Click to Upload',
        fr: 'Glissez-déposez ou cliquez pour télécharger'
      });
    } else if (fileCount <= 2) {
      return filenames.join(', ');
    }

    const displayed = filenames.slice(0, 2).join(', ');
    const remaining = fileCount - 2;

    return t({
      en: `${displayed}, and ${remaining} more files...`,
      fr: `${displayed} et ${remaining} autres fichiers...`
    });
  }, [files, t]);

  const typeDescriptor = useMemo(() => {
    if (type === null) {
      return {
        icon: FileIcon,
        label: t({ en: 'Any file type', fr: 'Tout type de fichier' })
      };
    }
    return FILE_TYPE_DESCRIPTORS[type];
  }, [type, t]);

  const allowanceText = useMemo(() => {
    const { max, min } = count;
    if (min === max) {
      return t({
        en: min === 1 ? 'Exactly 1 File Required' : `Exactly ${min} Files Required`,
        fr: min === 1 ? 'Exactement 1 fichier requis' : `Exactement ${min} fichiers requis`
      });
    }
    return t({
      en: `Between ${min} and ${max} Files Allowed`,
      fr: `Entre ${min} et ${max} fichiers autorisés`
    });
  }, [count.min, count.max, t]);

  const hasFiles = files.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 flex-col">
          <span className="text-[13px] font-medium uppercase tracking-tight text-slate-500 dark:text-slate-400">
            {t({ en: 'File Group', fr: 'Groupe de fichiers' })} {index + 1}
          </span>
          <h3 className="truncate font-semibold tracking-tight text-slate-900 dark:text-slate-100">{label}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[13px] font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <typeDescriptor.icon
              className="text-slate-500 dark:text-slate-400"
              style={{ height: 14, strokeWidth: 2, width: 14 }}
            />
            {typeDescriptor.label}
          </span>
        </div>
      </div>
      <div
        className="group flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/50 px-4 py-6 transition-colors hover:border-slate-400 hover:bg-slate-100/60 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-500 dark:hover:bg-slate-800/60"
        data-testid="dropzone"
        {...getRootProps()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/70 text-slate-600 transition-colors group-hover:bg-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700">
            <UploadIcon style={{ height: 16, strokeWidth: 2, width: 16 }} />
          </div>
          <h4 className="max-w-full truncate text-[15px] font-medium tracking-tight text-slate-800 dark:text-slate-100">
            {displayText}
          </h4>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {hasFiles
              ? t({
                  en: files.length === 1 ? '1 file selected' : `${files.length} files selected`,
                  fr: files.length === 1 ? '1 fichier sélectionné' : `${files.length} fichiers sélectionnés`
                })
              : allowanceText}
          </p>
        </div>
        <input {...getInputProps()} />
      </div>
      {rejectedNames.length > 0 && (
        <ErrorBox
          issues={rejectedNames.map((name) =>
            t({
              en: `"${name}" was rejected — only ${typeDescriptor.label} files are accepted`,
              fr: `« ${name} » a été rejeté — seuls les fichiers ${typeDescriptor.label} sont acceptés`
            })
          )}
          title={t({ en: 'Unsupported file type', fr: 'Type de fichier non pris en charge' })}
        />
      )}
      {issues && <ErrorBox issues={issues.map((issue) => t(issue))} title={t({ en: 'Invalid Input' })} />}
    </div>
  );
});
