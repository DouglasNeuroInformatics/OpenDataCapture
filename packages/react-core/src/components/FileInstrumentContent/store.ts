import { createContext, useContext } from 'react';

import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { FileInstrumentContentProps, FileInstrumentContentStore, UploadProgressEvent } from './types';

export const FileInstrumentContentStoreContext = createContext<{
  store: ReturnType<typeof createFileInstrumentContentStore>;
}>(null!);

export function createFileInstrumentContentStore(props: FileInstrumentContentProps) {
  return createStore(
    immer<FileInstrumentContentStore>((set, get) => ({
      actions: {
        setFiles(id, files) {
          set((state) => {
            state.uploadMap[id] = files;
          });
        },
        submit: async () => {
          const { props, uploadMap } = get();
          const errors: FileInstrumentContentStore.Errors = {};
          props.instrument.content.fileGroups.forEach(({ basename, count }) => {
            const actual = uploadMap[basename]!.length;
            if (actual < count.min || actual > count.max) {
              const required = count.min === count.max ? `${count.min}` : `between ${count.min} and ${count.max}`;
              const requiredFr = count.min === count.max ? `${count.min}` : `entre ${count.min} et ${count.max}`;
              const isPluralRequired = count.min !== count.max || count.min !== 1;
              errors[basename] ??= [];
              errors[basename].push({
                en: `You uploaded ${actual} file${actual === 1 ? '' : 's'}, but ${required} ${isPluralRequired ? 'are' : 'is'} required`,
                fr: `Vous avez téléchargé ${actual} fichier${actual === 1 ? '' : 's'}, mais ${requiredFr} ${isPluralRequired ? 'sont' : 'est'} requis`
              });
            }
          });

          if (Object.keys(errors).length) {
            set((state) => {
              state.errors = errors;
            });
            return;
          }

          const allFiles = Object.values(uploadMap).flat();
          const loaded = new Map<File, number>(allFiles.map((file) => [file, 0]));

          set((state) => {
            state.errors = {};
            state.status = 'PENDING';
            state.uploadState = {
              loadedFiles: 0,
              loadedSize: 0,
              totalFiles: allFiles.length,
              totalProgress: 0,
              totalSize: allFiles.reduce((sum, file) => sum + file.size, 0)
            };
          });

          const onProgress = (file: File, event: UploadProgressEvent) => {
            set((state) => {
              const diff = event.loaded - loaded.get(file)!;
              state.uploadState!.loadedSize += diff;
              state.uploadState!.totalProgress = (state.uploadState!.loadedSize / state.uploadState!.totalSize) * 100;
              loaded.set(file, event.loaded);
            });
          };

          const onNext = () => {
            set((state) => {
              state.uploadState!.loadedFiles += 1;
            });
          };

          const [result] = await Promise.allSettled([
            props.onSubmit({ data: {}, kind: 'FILE', onNext, onProgress, uploadMap }),
            new Promise((resolve) => setTimeout(resolve, 300))
          ]);

          if (result.status === 'rejected') {
            console.error(result.reason);
            set((state) => {
              state.status = 'FAILED';
              state.uploadState = null;
            });
          } else {
            // make sure animation goes to 100% for aesthetics
            set((state) => {
              state.uploadState!.totalProgress = 100;
            });
            await new Promise((resolve) => setTimeout(resolve, 500));
            set((state) => {
              state.status = 'SUBMITTED';
              state.uploadState = null;
            });
          }
        }
      },
      errors: {},
      props,
      status: 'READY',
      uploadMap: Object.fromEntries(props.instrument.content.fileGroups.map((file) => [file.basename, []])),
      uploadState: null
    }))
  );
}

export function useFileInstrumentContentStore<T>(selector: (state: FileInstrumentContentStore) => T) {
  const context = useContext(FileInstrumentContentStoreContext);
  return useStore(context.store, selector);
}
