import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';
import { setupHandlers } from './handlers/setup.handlers';

export const worker = setupWorker(...authHandlers, ...setupHandlers);
