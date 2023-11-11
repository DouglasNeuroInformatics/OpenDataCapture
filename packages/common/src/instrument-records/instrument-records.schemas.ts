import { z } from 'zod';

export const createInstrumentRecordDataSchema = z.object({
  assignmentId: z.string().optional(),
  data: z.unknown(),
  date: z.coerce.date(),
  groupId: z.string().optional(),
  instrumentId: z.string(),
  subjectIdentifier: z.string()
});

export type CreateInstrumentRecordData = z.infer<typeof createInstrumentRecordDataSchema>;
