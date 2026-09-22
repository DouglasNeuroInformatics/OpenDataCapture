import { $Language } from '@opendatacapture/schemas/core';
import { z } from 'zod/v4';

/**
 * The contract between the editor page and the preview frame. Everything crossing that boundary
 * is parsed on arrival: the frame runs instrument source the editor did not write, so the editor
 * treats what comes back as data, and the frame only acts on messages from the window that embeds it.
 */

const LOOPBACK_ALIASES: { [hostname: string]: string } = {
  '127.0.0.1': 'localhost',
  localhost: '127.0.0.1'
};

export type SerializedError = {
  cause?: SerializedError;
  message: string;
  name: string;
  stack?: string;
};
export const $SerializedError: z.ZodType<SerializedError> = z.object({
  cause: z.lazy(() => $SerializedError).optional(),
  message: z.string(),
  name: z.string(),
  stack: z.string().optional()
});

export const $PreviewTheme = z.enum(['dark', 'light']);

export type EditorMessage = z.infer<typeof $EditorMessage>;
export const $EditorMessage = z.discriminatedUnion('type', [
  z.object({
    bundle: z.string(),
    language: $Language,
    theme: $PreviewTheme,
    type: z.literal('render')
  })
]);

export type PreviewErrorStage = z.infer<typeof $PreviewErrorStage>;
export const $PreviewErrorStage = z.enum(['interpret', 'runtime']);

export type PreviewMessage = z.infer<typeof $PreviewMessage>;
export const $PreviewMessage = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ error: $SerializedError, stage: $PreviewErrorStage, type: z.literal('error') }),
  z.object({ data: z.unknown(), type: z.literal('submit') })
]);

export type PreviewOriginResolution =
  | { origin: string; status: 'ok' }
  | { reason: 'same-origin' | 'unknown-host'; status: 'error' };

/**
 * The origin the preview frame is served from, which must differ from the editor's so the code it
 * runs cannot reach the editor's storage. A deployment names it with `PLAYGROUND_PREVIEW_ORIGIN`;
 * a dev server has two loopback names for one origin, so the other one is used.
 */
export function resolvePreviewOrigin(
  location: Pick<Location, 'hostname' | 'origin' | 'port' | 'protocol'>,
  configuredOrigin: string
): PreviewOriginResolution {
  if (configuredOrigin) {
    const origin = new URL(configuredOrigin).origin;
    return origin === location.origin ? { reason: 'same-origin', status: 'error' } : { origin, status: 'ok' };
  }
  const alias = LOOPBACK_ALIASES[location.hostname];
  if (!alias) {
    return { reason: 'unknown-host', status: 'error' };
  }
  return { origin: `${location.protocol}//${alias}${location.port ? `:${location.port}` : ''}`, status: 'ok' };
}

export function serializeError(error: unknown): SerializedError {
  if (!(error instanceof Error)) {
    return { message: String(error), name: 'Error' };
  }
  return {
    cause: error.cause === undefined ? undefined : serializeError(error.cause),
    message: error.message,
    name: error.name,
    stack: error.stack
  };
}

export function deserializeError({ cause, message, name, stack }: SerializedError): Error {
  const error = new Error(message, cause ? { cause: deserializeError(cause) } : undefined);
  error.name = name;
  error.stack = stack;
  return error;
}
