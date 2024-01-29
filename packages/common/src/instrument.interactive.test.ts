/// <reference types="@open-data-capture/instrument-library" />

import { describe, expect, it } from 'bun:test';

import clickTask from '@open-data-capture/instrument-library/interactive/click-task.tsx';

import { $InteractiveInstrument } from './instrument.interactive';

describe('$InteractiveInstrument', () => {
  it('should parse the click task', () => {
    expect($InteractiveInstrument.parse(clickTask)).toMatchObject(clickTask);
  });
});
