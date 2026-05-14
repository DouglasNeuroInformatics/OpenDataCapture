import React, { Fragment, useEffect, useRef } from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { RefreshCwIcon } from 'lucide-react';
import { match } from 'ts-pattern';

import { NavigationBlocker } from '../NavigationBlocker';
import { Dropzone } from './Dropzone';
import { ErrorBox } from './ErrorBox';
import {
  createFileInstrumentContentStore,
  FileInstrumentContentStoreContext,
  useFileInstrumentContentStore
} from './store';
import { UploadProgressBar } from './UploadProgressBar';

import type { FileInstrumentContentProps } from './types';

const _FileInstrumentContent: React.FC<FileInstrumentContentProps> = () => {
  const actions = useFileInstrumentContentStore((store) => store.actions);
  const fileGroups = useFileInstrumentContentStore((store) => store.props.instrument.content.fileGroups);
  const onSuccess = useFileInstrumentContentStore((store) => store.props.onSuccess);
  const status = useFileInstrumentContentStore((store) => store.status);

  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'SUBMITTED') {
      onSuccess?.();
    }
  }, [onSuccess, status]);

  return (
    <Fragment>
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
      <NavigationBlocker
        active={status === 'PENDING'}
        message={t({
          en: 'Are you sure you want to leave this page? Data is currently uploading and will be lost if you leave this page now.',
          fr: 'Êtes-vous sûr de vouloir quitter cette page ? Des données sont en cours de téléversement et seront perdues si vous quittez la page maintenant.'
        })}
      />
    </Fragment>
  );
};

export const FileInstrumentContent: React.FC<FileInstrumentContentProps> = (props) => {
  const storeRef = useRef(createFileInstrumentContentStore(props));
  return (
    <FileInstrumentContentStoreContext.Provider value={{ store: storeRef.current }}>
      <_FileInstrumentContent {...props} />
    </FileInstrumentContentStoreContext.Provider>
  );
};
