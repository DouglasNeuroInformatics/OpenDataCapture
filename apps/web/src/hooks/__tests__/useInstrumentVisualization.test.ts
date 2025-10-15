import React from 'react';

import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentVisualization } from '../useInstrumentVisualization';

const mockInstrument = {
  useInstrument: vi.fn(() => ({
    instrument: {
      internal: {
        name: 'test'
      }
    }
  }))
};

vi.mock('@/hooks/useInstrument', () => ({
  useInstrument: () => mockInstrument
}));

const mockStore = {
  useAppStore: vi.fn(() => ({
    store: {
      currentGroup: 'testGroup',
      currentUser: 'testUser'
    }
  }))
};
const mockDownload = {
  useDownload: vi.fn()
};
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
  useDownload: () => mockDownload,
  useNotificationsStore: () => mockNotification,
  useTranslation: () => mockTranslation
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  return {
    ...actual,
    useEffect: vi.fn(),
    useMemo: vi.fn(),
    useState: vi.fn(() => [
      'mockedRecords',
      vi.fn(() => ({
        __date__: new Date().getDate(),
        __time__: new Date().getTime(),
        someValue: 'abc'
      }))
    ])
  };
});

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => mockInfoQuery
}));

vi.mock('@/hooks/useInstrumentRecords', () => ({
  useInstrumentRecords: () => mockInstrumentRecords
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
      expect(mockInstrument.useInstrument).toHaveBeenCalledOnce();
      expect(mockStore.useAppStore).toHaveBeenCalled();
      expect(records).toBeDefined();
    });
  });
});
