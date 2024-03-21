/// <reference types="@open-data-capture/instrument-library" />

import clickTask from '@open-data-capture/instrument-library/interactive/click-task.tsx';
import { describe, expect, it } from 'vitest';

import { $InteractiveInstrument } from './instrument.interactive.js';

/**
 * For interactive instruments, cannot use `.toMatchObject`, since the render function returned by
 * Zod is not named "render", which causes it to fail the comparison, despise the same signature.
 */

describe('$InteractiveInstrument', () => {
  it('should parse the click task', async () => {
    await expect($InteractiveInstrument.safeParseAsync(clickTask)).resolves.toMatchObject({ success: true });
  });
});
