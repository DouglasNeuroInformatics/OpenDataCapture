import { useMemo } from 'react';

import type { ListboxDropdownOption } from '@douglasneuroinformatics/libui/components';
import type { LinearRegressionResults } from '@opendatacapture/schemas/instrument-records';
import { pickBy } from 'lodash-es';

import type { InstrumentVisualizationRecord } from './useInstrumentVisualization';

type GraphRecord = {
  [key: string]: number;
  __time__: number;
};

type UseGraphDataOptions = {
  models?: LinearRegressionResults;
  records: InstrumentVisualizationRecord[];
  selectedMeasures: ListboxDropdownOption[];
};

export function useGraphData({ models, records, selectedMeasures }: UseGraphDataOptions): GraphRecord[] {
  return useMemo(() => {
    const graphRecords: GraphRecord[] = [];
    if (records) {
      for (const record of records) {
        const graphRecord: GraphRecord = {
          ...pickBy(record, (_, key) => selectedMeasures.find((item) => item.key === key)),
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
