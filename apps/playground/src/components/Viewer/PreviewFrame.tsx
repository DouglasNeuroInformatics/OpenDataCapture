import { useEffect, useRef, useState } from 'react';

import { useTheme, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { match } from 'ts-pattern';

import { $PreviewMessage, deserializeError } from '@/preview/protocol';
import type { EditorMessage, PreviewErrorStage } from '@/preview/protocol';

export type PreviewFrameProps = {
  bundle: string;
  onError: (stage: PreviewErrorStage, error: Error) => void;
  onSubmit: (data: unknown) => void;
  /** Where the frame is served from. Must not be this page's origin; see `resolvePreviewOrigin`. */
  previewOrigin: string;
};

/**
 * Embeds the preview document and bridges it to the editor. The bundle runs over there, on an
 * origin that holds none of the editor's state, so the sandbox keeps `allow-same-origin`: it lets
 * the frame use its own storage and nested frames, and grants nothing on this origin. Every message
 * is accepted only from that frame's window and origin, then parsed before anything acts on it.
 */
export const PreviewFrame = ({ bundle, onError, onSubmit, previewOrigin }: PreviewFrameProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const handlersRef = useRef({ onError, onSubmit });
  const [isReady, setIsReady] = useState(false);
  const [theme] = useTheme();
  const { resolvedLanguage } = useTranslation();

  handlersRef.current = { onError, onSubmit };

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      const frameWindow = frameRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow || event.origin !== previewOrigin) {
        return;
      }
      const result = $PreviewMessage.safeParse(event.data);
      if (!result.success) {
        console.error('Editor ignored a malformed message from the preview frame', result.error);
        return;
      }
      match(result.data)
        .with({ type: 'ready' }, () => setIsReady(true))
        .with({ type: 'error' }, ({ error, stage }) => handlersRef.current.onError(stage, deserializeError(error)))
        .with({ type: 'submit' }, ({ data }) => handlersRef.current.onSubmit(data))
        .exhaustive();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewOrigin]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const message: EditorMessage = { bundle, language: resolvedLanguage, theme, type: 'render' };
    frameRef.current?.contentWindow?.postMessage(message, previewOrigin);
  }, [bundle, isReady, previewOrigin, resolvedLanguage, theme]);

  return (
    <iframe
      allow="clipboard-write; fullscreen"
      className="h-full w-full"
      data-testid="preview-frame"
      ref={frameRef}
      sandbox="allow-downloads allow-forms allow-modals allow-same-origin allow-scripts"
      src={`${previewOrigin}/preview.html`}
      title="Open Data Capture - Instrument Preview"
    />
  );
};
