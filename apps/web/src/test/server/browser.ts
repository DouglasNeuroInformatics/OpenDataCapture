import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';
import { instrumentHandlers } from './handlers/instrument.handlers';
import { instrumentRecordHandlers } from './handlers/instrument-record.handlers';
import { setupHandlers } from './handlers/setup.handlers';
import { subjectHandlers } from './handlers/subject.handlers';
import { summaryHandlers } from './handlers/summary.handlers';
import { visitHandler } from './handlers/visit.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...instrumentRecordHandlers,
  ...instrumentHandlers,
  ...setupHandlers,
  ...subjectHandlers,
  ...summaryHandlers,
  ...visitHandler
);
