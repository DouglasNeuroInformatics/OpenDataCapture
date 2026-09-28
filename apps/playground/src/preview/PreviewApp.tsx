import { useEffect, useState } from 'react';

import { THEME_ATTRIBUTE, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

import { $EditorMessage, serializeError } from './protocol';

import type { EditorMessage, PreviewMessage } from './protocol';

type Editor = {
  /** The origin of the page embedding this frame, learned from its first message and replied to alone. */
  origin: string;
  render: Extract<EditorMessage, { type: 'render' }>;
};

/**
 * The document inside the preview frame. It renders whichever bundle the embedding editor sends and
 * reports errors and submissions back to it. Nothing here touches the editor's own state: the frame
 * is on another origin, and the only channel between the two is these messages.
 */
export const PreviewApp = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { changeLanguage } = useTranslation();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== window.parent) {
        return;
      }
      const result = $EditorMessage.safeParse(event.data);
      if (!result.success) {
        console.error('Preview frame ignored a malformed message from the editor', result.error);
        return;
      }
      setEditor({ origin: event.origin, render: result.data });
    };
    window.addEventListener('message', handleMessage);
    // The editor's origin is unknown until it sends something, and this message carries nothing.
    window.parent.postMessage({ type: 'ready' } satisfies PreviewMessage, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }
    document.documentElement.setAttribute(THEME_ATTRIBUTE, editor.render.theme);
    changeLanguage(editor.render.language);
  }, [editor?.render.language, editor?.render.theme]);

  if (!editor) {
    return null;
  }

  const { origin, render } = editor;
  const post = (message: PreviewMessage) => window.parent.postMessage(message, origin);

  return (
    <div className="h-full min-h-screen w-full overflow-y-auto p-1">
      <ErrorBoundary
        fallbackRender={() => null}
        key={render.bundle}
        onError={(error) => post({ error: serializeError(error), stage: 'runtime', type: 'error' })}
      >
        <ScalarInstrumentRenderer
          options={{ validate: true }}
          target={{ bundle: render.bundle, id: null! }}
          onCompileError={(error) => post({ error: serializeError(error), stage: 'interpret', type: 'error' })}
          onSubmit={({ data }) => post({ data, type: 'submit' })}
        />
      </ErrorBoundary>
    </div>
  );
};
