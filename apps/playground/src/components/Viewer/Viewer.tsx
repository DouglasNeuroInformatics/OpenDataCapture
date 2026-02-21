import { useCallback, useState } from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';
import { useInterval } from '@douglasneuroinformatics/libui/hooks';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { bundle } from '@opendatacapture/instrument-bundler';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';
import { match, P } from 'ts-pattern';

import { useFilesRef } from '@/hooks/useFilesRef';
import type { EditorFile } from '@/models/editor-file.model';
import { useAppStore } from '@/store';
import { editorFileToInput, hashFiles } from '@/utils/file';

import { CompileErrorFallback } from './CompileErrorFallback';
import { RuntimeErrorFallback } from './RuntimeErrorFallback';

export const Viewer = () => {
  const editorFilesRef = useFilesRef();
  const indexFilename = useAppStore((store) => store.indexFilename);
  const refreshInterval = useAppStore((store) => store.settings.refreshInterval);
  const [filesHash, setFilesHash] = useState<string>('');

  const key = useAppStore((store) => store.viewer.key);
  const state = useAppStore((store) => store.transpilerState);
  const setState = useAppStore((store) => store.setTranspilerState);

  const transpile = useCallback(async (files: EditorFile[]) => {
    setState({ status: 'building' });
    const inputs: BundlerInput[] = files.map(editorFileToInput);
    try {
      setState({ bundle: await bundle({ inputs }), status: 'built' });
    } catch (err) {
      setState({
        error: err instanceof Error ? err : new Error('Unexpected Error', { cause: err }),
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

  return (
    <div
      className="h-full overflow-y-scroll pr-1.5 lg:pr-3"
      key={key}
      style={{ scrollbarColor: 'var(--muted) var(--background)', scrollbarWidth: 'thin' }}
    >
      {match(state)
        .with({ status: 'built' }, ({ bundle }) => (
          <ErrorBoundary
            FallbackComponent={(props) => (
              <RuntimeErrorFallback context={{ files: editorFilesRef.current, indexFilename }} {...props} />
            )}
          >
            <ScalarInstrumentRenderer
              options={{ validate: true }}
              target={{ bundle, id: null! }}
              onCompileError={(error) => setState({ error, status: 'error' })}
              onSubmit={({ data }) => {
                // eslint-disable-next-line no-alert
                alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
              }}
            />
          </ErrorBoundary>
        ))
        .with({ status: 'error' }, (props) => (
          <CompileErrorFallback context={{ files: editorFilesRef.current, indexFilename }} {...props} />
        ))
        .with({ status: P.union('building', 'initial') }, () => <Spinner />)
        .exhaustive()}
    </div>
  );
};
