import { useEffect } from 'react';

import type { MonacoType } from '@/components/Editor/types';
import { useAppStore } from '@/store';
import type { EditorError } from '@/store/types';

const TYPE_CHECKED_MARKER_OWNERS: string[] = ['javascript', 'typescript'];

/**
 * Markers are keyed by model, and monaco holds models the instrument does not own: the runtime
 * declarations, `globals.d.ts`, and the models of files the user has since deleted, which are never
 * disposed. Asking file by file is what keeps those out of the result.
 */
const collectEditorErrors = (monaco: MonacoType, filenames: string[]): EditorError[] => {
  return filenames.flatMap((filename) => {
    return monaco.editor
      .getModelMarkers({ resource: monaco.Uri.parse(filename) })
      .filter(
        (marker) => marker.severity === monaco.MarkerSeverity.Error && TYPE_CHECKED_MARKER_OWNERS.includes(marker.owner)
      )
      .map((marker) => ({ filename, line: marker.startLineNumber, message: marker.message }));
  });
};

export function useEditorErrorSync(monaco: MonacoType | null) {
  const setEditorErrors = useAppStore((store) => store.setEditorErrors);
  useEffect(() => {
    if (!monaco) {
      return;
    }
    const refresh = () => {
      const filenames = useAppStore.getState().files.map((file) => file.name);
      setEditorErrors(collectEditorErrors(monaco, filenames));
    };
    refresh();
    const markersListener = monaco.editor.onDidChangeMarkers(refresh);
    const unsubscribeFromFiles = useAppStore.subscribe((store) => store.files, refresh);
    return () => {
      markersListener.dispose();
      unsubscribeFromFiles();
      setEditorErrors([]);
    };
  }, [monaco]);
}
