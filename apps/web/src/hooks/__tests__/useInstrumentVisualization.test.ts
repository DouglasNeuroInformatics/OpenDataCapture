// import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
// import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { useInstrumentVisualization } from '../useInstrumentVisualization';

describe('useInstrumentVisualization tests', () => {
  describe('CSV', () => {
    it('Should download', () => {
      const { dl, records } = useInstrumentVisualization({
        params: { subjectId: 'testId' }
      });
      expect(records).toBeDefined();
      console.log(records);
      dl('CSV');
    });
  });
});
