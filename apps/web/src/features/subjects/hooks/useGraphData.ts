import { useMemo } from 'react';

import type { SelectOption } from '@douglasneuroinformatics/ui';
import type { UnilingualInstrumentSummary } from '@open-data-capture/common/instrument';
import type { LinearRegressionResults } from '@open-data-capture/common/instrument-records';
import _ from 'lodash';

import type { InstrumentVisualizationRecord } from './useInstrumentVisualization';

export type GraphRecord = {
  [key: string]: number;
  __time__: number;
};

export type UseGraphDataOptions = {
  instrument: UnilingualInstrumentSummary;
  measures: SelectOption[];
  models: LinearRegressionResults;
  records: InstrumentVisualizationRecord[];
};

export function useGraphData({
  instrument,
  measures,
  models,
  records
}: UseGraphDataOptions): GraphRecord[] {
  return useMemo(() => {
    const graphRecords: GraphRecord[] = [];
    if (records) {
      for (const record of records) {
        const graphRecord: GraphRecord = {
          ..._.pickBy(record, (_, key) => measures.find((item) => item.key === key)),
          __time__: record.__time__
        };
        for (const key in record) {
          const model = models[key];
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
  }, [instrument, measures, models, records]);
}
