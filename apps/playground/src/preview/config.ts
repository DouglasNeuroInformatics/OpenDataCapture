import { z } from 'zod/v4';

/**
 * Settings that vary by deployment, so they cannot be baked into the one published image. Caddy
 * serves them at `/config.json` from the container's environment, and `vite.config.ts` does the same
 * for a dev server.
 */
export type PlaygroundConfig = z.infer<typeof $PlaygroundConfig>;
export const $PlaygroundConfig = z.object({
  /** `PLAYGROUND_PREVIEW_ORIGIN`, or empty to derive one from the dev server (see `resolvePreviewOrigin`). */
  previewOrigin: z.union([z.literal(''), z.url({ protocol: /^https?$/ })])
});

export async function fetchPlaygroundConfig(): Promise<PlaygroundConfig> {
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error(`Failed to load /config.json: ${response.status} ${response.statusText}`);
  }
  return $PlaygroundConfig.parse(await response.json());
}
