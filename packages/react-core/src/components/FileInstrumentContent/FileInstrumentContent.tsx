import React, { useRef } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { RefreshCwIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { Dropzone } from './Dropzone';
import { ErrorBox } from './ErrorBox';
import {
  createFileInstrumentContentStore,
  FileInstrumentContentStoreContext,
  useFileInstrumentContentStore
} from './store';
import { UploadProgressBar } from './UploadProgressBar';

import type { FileInstrumentContentProps } from './types';

const _FileInstrumentContent: React.FC = () => {
  const actions = useFileInstrumentContentStore((store) => store.actions);
  const fileGroups = useFileInstrumentContentStore((store) => store.props.instrument.content.fileGroups);
  const status = useFileInstrumentContentStore((store) => store.status);

  const { t } = useTranslation();

  return (
    <div
      className="mx-auto mt-6 flex w-full flex-col gap-12"
      style={{ pointerEvents: status === 'SUBMITTED' || status === 'PENDING' ? 'none' : undefined }}
    >
      <div className="flex flex-col gap-12">
        {fileGroups.map((_, index) => (
          <Dropzone index={index} key={index} />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        {match(status)
          .with('PENDING', () => <UploadProgressBar />)
          .with('FAILED', () => (
            <ErrorBox
              title={t({
                en: 'Something went wrong',
                es: 'Algo salió mal',
                fr: "Une erreur s'est produite"
              })}
            />
          ))
          .otherwise(() => null)}
        <Button
          className="flex items-center gap-2"
          disabled={status === 'PENDING' || status === 'SUBMITTED'}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          {t('libui.form.submit')}
          {status === 'PENDING' && <RefreshCwIcon className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

export const FileInstrumentContent: React.FC<FileInstrumentContentProps> = (props) => {
  const storeRef = useRef(createFileInstrumentContentStore(props));
  return (
    <FileInstrumentContentStoreContext.Provider value={{ store: storeRef.current }}>
      <_FileInstrumentContent />
    </FileInstrumentContentStoreContext.Provider>
  );
};
