import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { act, renderHook, waitFor } from '@testing-library/react';
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

const mockExcelDownloadFn = vi.hoisted(() => vi.fn());

const mockInfoQuery: {
  data: (
    | {
        details: { title: string };
        id: string;
        internal: { edition: number; name: string };
        kind: 'FORM';
      }
    | {
        details: { title: string };
        id: string;
        kind: 'SERIES';
        seriesItems: { id: string }[];
      }
  )[];
} = {
  data: []
};

const FIXED_TEST_DATE = new Date('2025-04-30T12:00:00Z');
const mockInstrumentRecords = {
  data: [
    {
      computedMeasures: {},
      data: { someValue: 'abc' },
      date: FIXED_TEST_DATE,
      sessionId: '123'
    }
  ]
};

const mockSessionWithUsername = {
  data: [
    {
      id: '123',
      user: {
        username: 'testusername'
      }
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

vi.mock('@/utils/excel', () => ({
  downloadSubjectTableExcel: mockExcelDownloadFn
}));

vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: () => mockInstrumentRecords
}));

vi.mock('@/hooks/useFindSessionQuery', () => ({
  useFindSessionQuery: () => mockSessionWithUsername
}));

describe('useInstrumentVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInfoQuery.data = [];
  });

  describe('CSV', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('CSV'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);
      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.csv');
      const csvContents = getContentFn();
      expect(csvContents).toMatch(
        `GroupID,subjectId,Date,Username,someValue\r\ntestGroupId,testId,${toBasicISOString(FIXED_TEST_DATE)},testusername,abc`
      );
    });
  });
  describe('TSV', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('TSV'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);
      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.tsv');
      const tsvContents = getContentFn();
      expect(tsvContents).toMatch(
        `GroupID\tsubjectId\tDate\tUsername\tsomeValue\r\ntestGroupId\ttestId\t${toBasicISOString(FIXED_TEST_DATE)}\ttestusername\tabc`
      );
    });
  });
  describe('CSV Long', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('CSV Long'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toContain('.csv');
      const csvLongContents = getContentFn();
      expect(csvLongContents).toMatch(
        `GroupID,Date,SubjectID,Username,Value,Variable\r\ntestGroupId,${toBasicISOString(FIXED_TEST_DATE)},testId,testusername,abc,someValue`
      );
    });
  });
  describe('TSV Long', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('TSV Long'));
      expect(records).toBeDefined();
      expect(mockDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(filename).toMatch('.tsv');
      const tsvLongContents = getContentFn();
      expect(tsvLongContents).toMatch(
        `GroupID\tDate\tSubjectID\tUsername\tValue\tVariable\r\ntestGroupId\t${toBasicISOString(FIXED_TEST_DATE)}\ttestId\ttestusername\tabc\tsomeValue`
      );
    });
  });
  describe('Excel', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('Excel'));
      expect(records).toBeDefined();
      expect(mockExcelDownloadFn).toHaveBeenCalledTimes(1);
      const [filename, getContentFn] = mockExcelDownloadFn.mock.calls[0] ?? [];
      expect(filename).toMatch('.xlsx');
      const excelContents = getContentFn;

      expect(excelContents).toEqual([
        {
          Date: '2025-04-30',
          GroupID: 'testGroupId',
          subjectId: 'testId',
          // eslint-disable-next-line perfectionist/sort-objects
          someValue: 'abc',
          Username: 'testusername'
        }
      ]);
    });
  });
  describe('Excel Long', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('Excel Long'));
      expect(records).toBeDefined();
      expect(mockExcelDownloadFn).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockExcelDownloadFn.mock.calls[0] ?? [];
      expect(filename).toMatch('.xlsx');
      const excelContents = getContentFn;

      expect(excelContents).toEqual([
        {
          Date: '2025-04-30',
          GroupID: 'testGroupId',
          SubjectID: 'testId',
          Username: 'testusername',
          Value: 'abc',
          Variable: 'someValue'
        }
      ]);
    });
  });
  describe('editions', () => {
    it('should list only the latest edition of an instrument, with every edition available as an option', async () => {
      mockInfoQuery.data = [
        {
          details: { title: 'Happiness Questionnaire' },
          id: 'hq-1',
          internal: { edition: 1, name: 'HQ' },
          kind: 'FORM'
        },
        {
          details: { title: 'Happiness Questionnaire' },
          id: 'hq-2',
          internal: { edition: 2, name: 'HQ' },
          kind: 'FORM'
        }
      ];
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      expect(result.current.instrumentOptions).toEqual({ 'hq-2': 'Happiness Questionnaire' });
      expect(result.current.editionOptions).toEqual({});
      act(() => result.current.setInstrumentId('hq-1'));
      await waitFor(() => {
        expect(Object.keys(result.current.editionOptions)).toEqual(['hq-1', 'hq-2']);
      });
    });

    it('should list each series separately without edition options', () => {
      mockInfoQuery.data = [
        {
          details: { title: 'Intake Series' },
          id: 'series-1',
          kind: 'SERIES',
          seriesItems: [{ id: 'hq-1' }]
        },
        {
          details: { title: 'Follow-up Series' },
          id: 'series-2',
          kind: 'SERIES',
          seriesItems: [{ id: 'hq-2' }]
        }
      ];

      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));

      expect(result.current.instrumentOptions).toEqual({
        'series-1': 'Intake Series',
        'series-2': 'Follow-up Series'
      });
      act(() => result.current.setInstrumentId('series-1'));
      expect(result.current.editionOptions).toEqual({});
    });
  });
  describe('JSON', () => {
    it('Should download', async () => {
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      const { records } = result.current;
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      act(() => result.current.dl('JSON'));
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
