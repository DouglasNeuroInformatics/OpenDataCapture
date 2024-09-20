import { describe, expect, it } from 'vitest';

import { downloadExcel } from '../excel';

describe('downloadExcel', () => {
  it('should be defined', () => {
    expect(downloadExcel).toBeDefined();
  });
});
