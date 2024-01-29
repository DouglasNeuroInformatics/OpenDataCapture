/// <reference types="@open-data-capture/instrument-library" />

import { describe, expect, it } from 'bun:test';

import clickTask from '@open-data-capture/instrument-library/interactive/click-task.tsx';

import { $InteractiveInstrument } from './instrument.interactive';

/**
 * For interactive instruments, cannot use `.toMatchObject`, since the render function returned by
 * Zod is not named "render", which causes it to fail the comparison, despise the same signature.
 */

describe('$InteractiveInstrument', () => {
  it('should parse the click task', () => {
    expect($InteractiveInstrument.safeParseAsync(clickTask)).resolves.toMatchObject({ success: true });
  });
});
