import _ from 'lodash';
import type { Jsonifiable } from 'type-fest';
import { z } from 'zod';

export const createInstrumentRecordDataSchema = z.object({
  assignmentId: z.string().optional(),
  data: z.custom<Jsonifiable>((data) => {
    try {
      return _.isEqual(data, JSON.parse(JSON.stringify(data)));
    } catch {
      return false;
    }
  }),
  date: z.coerce.date(),
  groupId: z.string().optional(),
  instrumentId: z.string(),
  subjectIdentifier: z.string()
});

export type CreateInstrumentRecordData = z.infer<typeof createInstrumentRecordDataSchema>;
