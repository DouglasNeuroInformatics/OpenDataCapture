import React from 'react';

import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentVisualization } from '../useInstrumentVisualization';
import { toBasicISOString } from '@douglasneuroinformatics/libjs';

const mockUseInstrument = vi.hoisted(() =>
  vi.fn(() => ({
    internal: {
      name: 'test'
    }
  }))
);

const mockRecords = [
  {
    __date__: new Date().getDate(),
    __time__: new Date().getTime(),
    someValue: 'abc'
  }
];

vi.mock('@/hooks/useInstrument', () => ({
  useInstrument: mockUseInstrument
}));

const mockStore = {
  useAppStore: vi.fn(() => ({
    store: {
      currentGroup: 'testGroup',
      currentUser: 'testUser'
    }
  }))
};

const mockBasicIsoString = '2025-04-30';

const mockUseDownload = vi.fn();

const mockNotification = {
  useNotificationsStore: vi.fn()
};
const mockTranslation = {
  useTranslation: vi.fn()
};

const mockInfoQuery = {
  useInstrumentInfoQuery: vi.fn()
};

const mockInstrumentRecords = {
  useInstrumentRecords: vi.fn()
};

vi.mock('@/store', () => ({
  useAppStore: () => mockStore
}));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useDownload: () => mockUseDownload,
  useNotificationsStore: () => mockNotification,
  useTranslation: () => mockTranslation
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  return {
    ...actual,
    useEffect: vi.fn(),
    useMemo: vi.fn(),
    useState: vi.fn(() => [mockRecords, 'setRecords'])
  };
});

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => mockInfoQuery
}));

vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: () => mockInstrumentRecords
}));

vi.mock('@douglasneuroinformatics/libjs', () => ({
  toBasicISOString: vi.fn(() => mockBasicIsoString)
}));

describe('useInstrumentVisualization tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV', () => {
    it('Should download', () => {
      vi.spyOn(React, 'useEffect').mockImplementation((fn) => fn());
      const { dl, records } = useInstrumentVisualization({
        params: { subjectId: 'testId' }
      });
      act(() => dl('CSV'));
      expect(records).toBeDefined();
      expect(mockUseDownload).toHaveBeenCalledTimes(1);

      const [filename, getContentFn] = mockUseDownload.mock.calls[0];
      expect(filename).toContain('.csv');
      const csvContents = getContentFn();
      expect(csvContents).toMatch('subjectId,Date,someValue\r\ntestId,2025-04-30,abc');
    });
  });
});
