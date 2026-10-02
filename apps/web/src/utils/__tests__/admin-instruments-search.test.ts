import { describe, expect, it } from 'vitest';

import { $AdminInstrumentsSearch } from '../admin-instruments-search';

describe('$AdminInstrumentsSearch', () => {
  it('should leave the view unset for a bare address, so the router does not rewrite it to add one', () => {
    expect($AdminInstrumentsSearch.parse({})).toEqual({ view: undefined });
  });

  it('should keep a requested view', () => {
    expect($AdminInstrumentsSearch.parse({ view: 'series' })).toEqual({ view: 'series' });
  });

  it('should drop an unknown view rather than fail, so a mistyped link still opens the forms view', () => {
    expect($AdminInstrumentsSearch.parse({ view: 'nonsense' })).toEqual({ view: undefined });
  });
});
