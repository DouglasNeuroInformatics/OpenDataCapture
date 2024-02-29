import { useMemo } from 'react';

import type { SelectOption } from '@douglasneuroinformatics/ui/legacy';
import type { LinearRegressionResults } from '@open-data-capture/common/instrument-records';
import _ from 'lodash';

import type { InstrumentVisualizationRecord } from './useInstrumentVisualization';

export type GraphRecord = {
  [key: string]: number;
  __time__: number;
};

export type UseGraphDataOptions = {
  models?: LinearRegressionResults;
  records: InstrumentVisualizationRecord[];
  selectedMeasures: SelectOption[];
};

export function useGraphData({ models, records, selectedMeasures }: UseGraphDataOptions): GraphRecord[] {
  return useMemo(() => {
    const graphRecords: GraphRecord[] = [];
    if (records) {
      for (const record of records) {
        const graphRecord: GraphRecord = {
          ..._.pickBy(record, (_, key) => selectedMeasures.find((item) => item.key === key)),
          __time__: record.__time__
        };
        for (const key in record) {
          const model = models?.[key];
          if (!model) {
            continue;
          }
          graphRecord[key + 'Group'] = Number((model.intercept + model.slope * graphRecord.__time__).toFixed(2));
        }
        graphRecords.push(graphRecord);
      }
      graphRecords.sort((a, b) => {
        if (a.__time__ > b.__time__) {
          return 1;
        } else if (b.__time__ > a.__time__) {
          return -1;
        }
        return 0;
      });
    }
    return graphRecords;
  }, [selectedMeasures, models, records]);
}
