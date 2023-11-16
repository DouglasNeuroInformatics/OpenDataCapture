import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';
import { setupHandlers } from './handlers/setup.handlers';
import { SummaryHandlers } from './handlers/summary.handlers';

export const worker = setupWorker(...authHandlers, ...setupHandlers, ...SummaryHandlers);
