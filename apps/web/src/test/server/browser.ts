import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';
import { formHandlers } from './handlers/form.handlers';
import { manageInstrumentHandlers } from './handlers/instrument-manager.handlers';
import { setupHandlers } from './handlers/setup.handlers';
import { subjectHandlers } from './handlers/subject.handlers';
import { summaryHandlers } from './handlers/summary.handlers';
import { visitHandler } from './handlers/visit.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...setupHandlers,
  ...summaryHandlers,
  ...visitHandler,
  ...formHandlers,
  ...subjectHandlers,
  ...manageInstrumentHandlers
);
