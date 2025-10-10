import { useInstrumentVisualization } from '../useInstrumentVisualization';
import { describe, expect, it } from 'vitest';

describe('dl', () => {
  describe('CSV', () => {
    it('Should download', () => {
      const { dl } = useInstrumentVisualization({
        params: { subjectId: 'testId' }
      });
      dl('CSV');
    });
  });
});
