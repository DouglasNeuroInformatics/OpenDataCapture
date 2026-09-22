import { useCallback, useMemo, useState } from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';
import { useInterval, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { bundle } from '@opendatacapture/instrument-bundler';
import { match, P } from 'ts-pattern';

import { useFilesRef } from '@/hooks/useFilesRef';
import type { EditorFile } from '@/models/editor-file.model';
import { resolvePreviewOrigin } from '@/preview/protocol';
import type { PreviewErrorStage } from '@/preview/protocol';
import { useAppStore } from '@/store';
import { editorFileToInput, hashFiles } from '@/utils/file';

import { CompileErrorFallback } from './CompileErrorFallback';
import { PreviewFrame } from './PreviewFrame';
import { PreviewOriginError } from './PreviewOriginError';
import { RuntimeErrorFallback } from './RuntimeErrorFallback';

/** An error the preview frame reported, kept with the bundle it belongs to so a rebuild clears it. */
type PreviewError = {
  bundle: string;
  error: Error;
  stage: PreviewErrorStage;
};

export const Viewer = () => {
  const editorFilesRef = useFilesRef();
  const indexFilename = useAppStore((store) => store.indexFilename);
  const refreshInterval = useAppStore((store) => store.settings.refreshInterval);
  const [filesHash, setFilesHash] = useState<string>('');
  const [previewError, setPreviewError] = useState<null | PreviewError>(null);

  const key = useAppStore((store) => store.viewer.key);
  const state = useAppStore((store) => store.transpilerState);
  const setState = useAppStore((store) => store.setTranspilerState);
  const { t } = useTranslation();

  const previewOrigin = useMemo(() => resolvePreviewOrigin(window.location, __PREVIEW_ORIGIN__), []);

  const transpile = useCallback(async (files: EditorFile[]) => {
    setState({ status: 'building' });
    const inputs: BundlerInput[] = files.map(editorFileToInput);
    try {
      setState({ bundle: await bundle({ inputs }), status: 'built' });
    } catch (err) {
      setState({
        error:
          err instanceof Error
            ? err
            : new Error(t({ en: 'Unexpected Error', fr: 'Erreur inattendue' }), { cause: err }),
        status: 'error'
      });
    } finally {
      setFilesHash(await hashFiles(files));
    }
  }, []);

  useInterval(() => {
    const currentFiles = editorFilesRef.current;
    hashFiles(currentFiles)
      .then((currentHash) => {
        if (currentHash !== filesHash) {
          void transpile(currentFiles);
        }
      })
      .catch(console.error);
  }, refreshInterval);

  const handleSubmit = (data: unknown) => {
    // eslint-disable-next-line no-alert
    alert(
      JSON.stringify(
        {
          _message: t({
            en: 'The following data will be submitted',
            fr: 'Les données suivantes seront soumises'
          }),
          data
        },
        null,
        2
      )
    );
  };

  const context = { files: editorFilesRef.current, indexFilename };

  return (
    <div
      className="h-full overflow-y-scroll pr-1.5 lg:pr-3"
      key={key}
      style={{ scrollbarColor: 'var(--muted) var(--background)', scrollbarWidth: 'thin' }}
    >
      {match({ previewOrigin, state })
        .with({ previewOrigin: { status: 'error' } }, ({ previewOrigin }) => (
          <PreviewOriginError reason={previewOrigin.reason} />
        ))
        .with(
          { previewOrigin: { status: 'ok' }, state: { status: 'built' } },
          ({ previewOrigin, state: { bundle } }) => {
            if (previewError?.bundle === bundle) {
              return previewError.stage === 'interpret' ? (
                <CompileErrorFallback context={context} error={previewError.error} />
              ) : (
                <RuntimeErrorFallback context={context} error={previewError.error} />
              );
            }
            return (
              <PreviewFrame
                bundle={bundle}
                previewOrigin={previewOrigin.origin}
                onError={(stage, error) => setPreviewError({ bundle, error, stage })}
                onSubmit={handleSubmit}
              />
            );
          }
        )
        .with({ state: { status: 'error' } }, ({ state }) => <CompileErrorFallback context={context} {...state} />)
        .with({ state: { status: P.union('building', 'initial') } }, () => <Spinner />)
        .exhaustive()}
    </div>
  );
};
