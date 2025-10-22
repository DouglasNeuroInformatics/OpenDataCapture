import { describe, expect, it } from 'vitest';

import { downloadExcel, downloadSubjectTableExcel } from '../excel';

describe('downloadExcel', () => {
  it('should be defined', () => {
    expect(downloadExcel).toBeDefined();
  });
});

describe('downloadSujectTableExcel', () => {
  it('should be defined', () => {
    expect(downloadSubjectTableExcel).toBeDefined();
  });
});
