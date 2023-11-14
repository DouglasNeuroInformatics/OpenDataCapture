import { setupWorker } from 'msw/browser';

import { handlers } from '../../msw/mocks/handlers';

const worker = setupWorker(...handlers);
await worker.start();
