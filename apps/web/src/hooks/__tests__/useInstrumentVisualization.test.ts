import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentVisualization } from '../useInstrumentVisualization';

const mockUseInstrument = vi.hoisted(() =>
  vi.fn(() => ({
    internal: {
      edition: 1,
      name: 'test'
    }
  }))
);

const mockStore = {
  currentGroup: { id: 'testGroupId' },
  currentUser: { username: 'testUser' }
};

const mockDownloadFn = vi.fn();

const mockInfoQuery = {
  data: []
};

const FIXED_TEST_DATE = new Date('2025-04-30T12:00:00Z');
const mockInstrumentRecords = {
  data: [
    {
      computedMeasures: {},
      data: { someValue: 'abc' },
      date: FIXED_TEST_DATE
    }
  ]
};

vi.mock('@/hooks/useInstrument', () => ({
  useInstrument: mockUseInstrument
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(mockStore))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useDownload: vi.fn(() => mockDownloadFn),
  useNotificationsStore: () => ({ addNotification: vi.fn() }),
  useTranslation: () => ({ t: vi.fn((key) => key) })
}));

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => mockInfoQuery
}));

vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: () => mockInstrumentRecords
}));

describe('useInstrumentVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV', () => {
    it('Should download', () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      act(() => result.current.dl('CSV'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);
      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.csv');
      const csvContents = getContentFn();
      expect(csvContents).toMatch(`subjectId,Date,someValue\r\ntestId,${toBasicISOString(FIXED_TEST_DATE)},abc`);
    });
  });
  describe('TSV', () => {
    it('Should download', () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { dl, records } = result.current;
      act(() => dl('TSV'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);
      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.tsv');
      const tsvContents = getContentFn();
      expect(tsvContents).toMatch(`subjectId\tDate\tsomeValue\r\ntestId\t${toBasicISOString(FIXED_TEST_DATE)}\tabc`);
    });
  });
  describe('CSV Long', () => {
    it('Should download', () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { dl, records } = result.current;
      act(() => dl('CSV Long'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.csv');
      const csvLongContents = getContentFn();
      expect(csvLongContents).toMatch(
        `Date,SubjectID,Value,Variable\r\n${toBasicISOString(FIXED_TEST_DATE)},testId,abc,someValue`
      );
    });
  });
  describe('TSV Long', () => {
    it('Should download', () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { dl, records } = result.current;
      act(() => dl('TSV Long'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toMatch('.tsv');
      const tsvLongContents = getContentFn();
      expect(tsvLongContents).toMatch(
        `Date\tSubjectID\tValue\tVariable\r\n${toBasicISOString(FIXED_TEST_DATE)}\ttestId\tabc\tsomeValue`
      );
    });
  });
  describe('JSON', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { dl, records } = result.current;
      act(() => dl('JSON'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toMatch('.json');
      const jsonContents = await getContentFn();
      expect(jsonContents).toContain('"someValue": "abc"');
      expect(jsonContents).toContain('"subjectID": "testId"');
    });
  });
});
