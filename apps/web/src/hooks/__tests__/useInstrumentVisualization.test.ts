import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentVisualization } from '../useInstrumentVisualization';

const MOCK_INSTRUMENT = { internal: { edition: 1, name: 'test' } };

const mockUseInstrument = vi.hoisted(() => vi.fn<() => null | typeof MOCK_INSTRUMENT>());

const mockAddNotification = vi.hoisted(() => vi.fn());

const mockStore: { currentGroup: null | { id: string }; currentUser: { username: string } } = {
  currentGroup: { id: 'testGroupId' },
  currentUser: { username: 'testUser' }
};

const mockDownloadFn = vi.fn();

const mockExcelDownloadFn = vi.hoisted(() => vi.fn());

const mockInfoQuery: {
  data?: (
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
const createMockRecords = (data: { [key: string]: unknown }) => [
  {
    computedMeasures: {},
    data,
    date: FIXED_TEST_DATE,
    session: { user: { username: 'testusername' } },
    sessionId: '123'
  }
];
const mockInstrumentRecords: { data?: { [key: string]: unknown }[] } = {
  data: createMockRecords({ someValue: 'abc' })
};

vi.mock('@/hooks/useInstrument', () => ({
  useInstrument: mockUseInstrument
}));

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector) => selector(mockStore))
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useDownload: vi.fn(() => mockDownloadFn),
  useNotificationsStore: () => ({ addNotification: mockAddNotification }),
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

describe('useInstrumentVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInstrument.mockReturnValue(MOCK_INSTRUMENT);
    mockStore.currentGroup = { id: 'testGroupId' };
    mockInfoQuery.data = [];
    mockInstrumentRecords.data = createMockRecords({ someValue: 'abc' });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('set fields', () => {
    const renderWithSetRecord = async () => {
      mockInstrumentRecords.data = createMockRecords({ causes: new Set(['FRIENDS', 'MONEY']) });
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      return result;
    };

    it('should export a set in a wide table as the subject table displays it, not as {}', async () => {
      const result = await renderWithSetRecord();
      act(() => result.current.dl('CSV'));
      const [, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(getContentFn()).toContain(`testusername,"FRIENDS, MONEY"`);
    });

    it('should export a set in a long table as the subject table displays it, not as {}', async () => {
      const result = await renderWithSetRecord();
      act(() => result.current.dl('CSV Long'));
      const [, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(getContentFn()).toContain(`testusername,"FRIENDS, MONEY",causes`);
    });

    it('should export a set in JSON as the subject table displays it, not as {}', async () => {
      const result = await renderWithSetRecord();
      act(() => result.current.dl('JSON'));
      const [, getContentFn] = mockDownloadFn.mock.calls[0] ?? [];
      expect(await getContentFn()).toContain('"causes": "FRIENDS, MONEY"');
    });
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

  describe('export guards', () => {
    it('should refuse to export before an instrument is selected', () => {
      mockUseInstrument.mockReturnValue(null);
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      act(() => result.current.dl('CSV'));
      expect(mockAddNotification).toHaveBeenCalledWith({ message: 'errors.noInstrumentSelected', type: 'error' });
      expect(mockDownloadFn).not.toHaveBeenCalled();
    });

    it('should refuse to export an instrument with no records', () => {
      mockInstrumentRecords.data = [];
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      act(() => result.current.dl('CSV'));
      expect(mockAddNotification).toHaveBeenCalledWith({ message: 'errors.noDataToExport', type: 'error' });
      expect(mockDownloadFn).not.toHaveBeenCalled();
    });
  });

  describe('record shapes', () => {
    const renderWithRecords = async (records: { [key: string]: unknown }[]) => {
      mockInstrumentRecords.data = records;
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      await waitFor(() => {
        expect(result.current.records.length).toBeGreaterThan(0);
      });
      return result;
    };

    it('should serialize an object value in a wide table, so it is not exported as [object Object]', async () => {
      const result = await renderWithRecords(createMockRecords({ nested: { x: 1 } }));
      act(() => result.current.dl('Excel'));
      expect(mockExcelDownloadFn.mock.calls[0]?.[1]).toMatchObject([{ nested: '{"x":1}' }]);
    });

    it('should export each entry of a record array as its own variable in a long table', async () => {
      const result = await renderWithRecords(createMockRecords({ items: [{ a: 1, b: 2 }] }));
      act(() => result.current.dl('Excel Long'));
      expect(mockExcelDownloadFn.mock.calls[0]?.[1]).toEqual([
        expect.objectContaining({ GroupID: 'testGroupId', Value: 1, Variable: 'items-a' }),
        expect.objectContaining({ GroupID: 'testGroupId', Value: 2, Variable: 'items-b' })
      ]);
    });

    it('should attribute a wide export to the root group when no group is selected', async () => {
      mockStore.currentGroup = null;
      const result = await renderWithRecords(createMockRecords({ someValue: 'abc' }));
      act(() => result.current.dl('Excel'));
      expect(mockExcelDownloadFn.mock.calls[0]?.[1]).toMatchObject([{ GroupID: 'root' }]);
    });

    it('should attribute every long export row to the root group when no group is selected', async () => {
      mockStore.currentGroup = null;
      const result = await renderWithRecords(createMockRecords({ items: [{ a: 1 }], someValue: 'abc' }));
      act(() => result.current.dl('Excel Long'));
      expect(mockExcelDownloadFn.mock.calls[0]?.[1]).toEqual([
        expect.objectContaining({ GroupID: 'root', Variable: 'items-a' }),
        expect.objectContaining({ GroupID: 'root', Variable: 'someValue' })
      ]);
    });

    it('should merge the computed measures into the record, ignoring data that is not an object', async () => {
      const result = await renderWithRecords([
        { computedMeasures: { total: 3 }, data: null, date: FIXED_TEST_DATE, id: 'record-1', session: null }
      ]);
      expect(result.current.records).toEqual([
        {
          __date__: FIXED_TEST_DATE,
          __id__: 'record-1',
          __time__: FIXED_TEST_DATE.getTime(),
          total: 3,
          username: 'N/A'
        }
      ]);
    });

    it('should notify the user when the records cannot be read', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockInstrumentRecords.data = [{ data: {}, date: '2025-04-30', id: 'record-1' }];
      renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      });
      expect(consoleError).toHaveBeenCalled();
    });

    it('should show no records until they have loaded, without reporting an error', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      mockInstrumentRecords.data = undefined;
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      expect(result.current.records).toEqual([]);
      expect(mockAddNotification).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('instrument options', () => {
    it('should keep the latest edition regardless of the order the editions arrive in', () => {
      mockInfoQuery.data = [
        { details: { title: 'HQ v2' }, id: 'hq-2', internal: { edition: 2, name: 'HQ' }, kind: 'FORM' },
        { details: { title: 'HQ v1' }, id: 'hq-1', internal: { edition: 1, name: 'HQ' }, kind: 'FORM' }
      ];
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      expect(result.current.instrumentOptions).toEqual({ 'hq-2': 'HQ v2' });
    });

    it('should offer no instruments or editions while the instrument info is loading', () => {
      mockInfoQuery.data = undefined;
      const { result } = renderHook(() => useInstrumentVisualization({ params: { subjectId: 'testId' } }));
      act(() => result.current.setInstrumentId('hq-1'));
      expect(result.current.instrumentOptions).toEqual({});
      expect(result.current.editionOptions).toEqual({});
    });
  });
});
