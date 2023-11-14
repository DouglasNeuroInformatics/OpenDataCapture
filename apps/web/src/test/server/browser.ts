import { setupWorker } from 'msw/browser';

import { authHandlers } from './handlers/auth.handlers';

export const worker = setupWorker(...authHandlers);
